import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

/**
 * API: Create Payment Link (External Integration)
 * Method: POST
 * URL: /api/payments/create
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { merchant_id, secret_key, amount, payer_email, description } = body;

    // 1. Validasi Input Dasar
    if (!merchant_id || !secret_key || !amount || !payer_email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: merchant_id, secret_key, amount, and payer_email are mandatory.' 
      }, { status: 400 });
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Amount must be a positive number.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 2. Autentikasi Merchant
    const usersRef = collection(firestore, 'users');
    const authQuery = query(
      usersRef, 
      where('merchantId', '==', merchant_id), 
      where('secretKey', '==', secret_key)
    );
    
    const authSnap = await getDocs(authQuery);
    if (authSnap.empty) {
      return NextResponse.json({ success: false, message: 'Invalid Merchant ID or Secret Key.' }, { status: 401 });
    }

    const merchantData = authSnap.docs[0].data();
    const merchantUid = merchantData.uid;

    // 3. Generate External ID & Checkout URL
    const external_id = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    // Tentukan base URL untuk link checkout
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const checkout_url = `${protocol}://${host}/checkout/${external_id}`;

    // 4. Simpan ke Firestore (stspay_transactions)
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const transactionData = {
      id: external_id,
      amount: Number(amount),
      status: 'PENDING',
      payerEmail: payer_email,
      description: description || 'External API Payment',
      userId: merchantUid,
      type: 'payment',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(transactionRef, transactionData);

    return NextResponse.json({
      success: true,
      data: {
        external_id: external_id,
        checkout_url: checkout_url,
        status: 'PENDING',
        amount: Number(amount),
        currency: 'IDR'
      }
    });

  } catch (error: any) {
    console.error('API Create Payment Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}
