import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
  setDoc
} from 'firebase/firestore';
import { getXenditPaymentRequest } from '@/lib/xendit/payment-request';

/**
 * API: Check Payment Status (External Integration)
 * Method: POST
 * URL: /payments/status (via api subdomain)
 * Melakukan sinkronisasi live jika transaksi masih PENDING.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid JSON format in request body. Please ensure your request body is valid JSON with double-quoted keys.' 
    }, { status: 400 });
  }

  try {
    const { merchant_id, secret_key, external_id } = body;

    // 1. Validasi Input
    if (!merchant_id || !secret_key || !external_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing credentials or external_id.' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 2. Autentikasi Merchant
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, message: 'Authentication failed: Invalid Secret Key.' }, { status: 401 });
    }

    const merchantData = authSnap.docs[0].data();
    const merchantUid = merchantData.uid;

    const storedId = (merchantData.merchantId || merchantData.clientKey || "").toString();
    if (storedId !== merchant_id.toString()) {
      return NextResponse.json({ success: false, message: 'Authentication failed: Merchant ID mismatch.' }, { status: 401 });
    }

    // 3. Ambil Data Transaksi dari Firestore
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const txSnap = await getDoc(transactionRef);

    if (!txSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }

    let txData = txSnap.data();

    if (txData.userId !== merchantUid) {
      return NextResponse.json({ success: false, message: 'Access denied to this transaction.' }, { status: 403 });
    }

    // 4. Sinkronisasi Live jika masih PENDING
    const paidStatuses = ['PAID', 'SETTLED', 'SUCCEEDED'];
    if (!paidStatuses.includes(txData.status) && txData.payment_info?.pr_id) {
      const xenditRes = await getXenditPaymentRequest(txData.payment_info.pr_id);
      
      if (xenditRes.success && xenditRes.data?.status === 'SUCCEEDED') {
        const netAmount = (txData.amount || 0) - (txData.fee_amount || 0);
        const merchantStsPayRef = doc(firestore, 'users', merchantUid, 'services', 'stspay');
        const globalHistoryRef = doc(firestore, 'transactions', external_id);
        const userHistoryRef = doc(firestore, 'users', merchantUid, 'transactions', external_id);

        await Promise.all([
          updateDoc(transactionRef, { 
            status: 'PAID', 
            updatedAt: serverTimestamp() 
          }),
          setDoc(globalHistoryRef, { 
            status: 'Success', 
            updatedAt: serverTimestamp() 
          }, { merge: true }),
          setDoc(userHistoryRef, { 
            status: 'Success', 
            updatedAt: serverTimestamp() 
          }, { merge: true }),
          updateDoc(merchantStsPayRef, {
            balance: increment(netAmount),
            updatedAt: serverTimestamp()
          })
        ]);

        // Update local data for response
        txData.status = 'PAID';
        txData.updatedAt = new Date();
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        external_id: txData.id,
        status: txData.status,
        amount: txData.amount,
        payer_email: txData.payerEmail,
        description: txData.description,
        created_at: txData.createdAt?.toDate ? txData.createdAt.toDate() : txData.createdAt,
        updated_at: txData.updatedAt?.toDate ? txData.updatedAt.toDate() : txData.updatedAt
      }
    });

  } catch (error: any) {
    console.error('API Status Payment Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}