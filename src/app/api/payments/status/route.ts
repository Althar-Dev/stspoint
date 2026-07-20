import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc 
} from 'firebase/firestore';

/**
 * API: Check Payment Status (External Integration)
 * Method: POST
 * URL: /payments/status (via api subdomain)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
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

    // Verify Identity
    const storedId = (merchantData.merchantId || merchantData.clientKey || "").toString();
    if (storedId !== merchant_id.toString()) {
      return NextResponse.json({ success: false, message: 'Authentication failed: Merchant ID mismatch.' }, { status: 401 });
    }

    // 3. Ambil Data Transaksi
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const txSnap = await getDoc(transactionRef);

    if (!txSnap.exists()) {
      return NextResponse.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
    }

    const txData = txSnap.data();

    // Pastikan transaksi ini milik merchant yang merequest
    if (txData.userId !== merchantUid) {
      return NextResponse.json({ success: false, message: 'Access denied to this transaction.' }, { status: 403 });
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
