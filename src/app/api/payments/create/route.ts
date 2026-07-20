import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { createStsPayment } from '@/lib/xendit/create';
import { createXenditPaymentRequest } from '@/lib/xendit/payment-request';

/**
 * API: Create Payment (Unified STSPay Entry Point)
 * Method: POST
 * URL: /payments/create (via api subdomain)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      merchant_id, 
      secret_key, 
      amount, 
      payer_email, 
      description,
      type = 'payment_link' 
    } = body;

    // Capture dynamic callback URL from header
    const callbackUrl = request.headers.get('x-callback-url');

    // 1. Validasi Input Dasar
    if (!merchant_id || !secret_key || !amount || !payer_email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: merchant_id, secret_key, amount, and payer_email are mandatory.' 
      }, { status: 400 });
    }

    const baseAmount = Number(amount);
    if (isNaN(baseAmount) || baseAmount < 100) {
      return NextResponse.json({ 
        success: false, 
        message: 'Amount must be at least 100.' 
      }, { status: 400 });
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

    // 3. Generate External ID
    const external_id = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const checkout_url = `${protocol}://${host}/checkout/${external_id}`;

    let responseData: any = {
      external_id,
      status: 'PENDING',
      amount: baseAmount
    };

    let paymentInfo: any = {};

    // 4. Handle specific payment types
    if (type === 'qris') {
      const qrisRes = await createXenditPaymentRequest({
        reference_id: external_id,
        amount: baseAmount,
        currency: 'IDR',
        description: description || 'STSPay QRIS Payment',
        payment_method: {
          type: 'QR_CODE',
          reusability: 'ONE_TIME_USE',
          qr_code: {
            channel_code: 'QRIS',
            channel_properties: {}
          }
        }
      });

      if (!qrisRes.success) {
        return NextResponse.json({ success: false, message: qrisRes.message }, { status: 500 });
      }

      const qrData = qrisRes.data;
      paymentInfo = {
        pr_id: qrData.id,
        qr_string: qrData.payment_method.qr_code.channel_properties.qr_string,
        provider: 'Xendit',
        type: 'qris'
      };

      responseData.qr_string = paymentInfo.qr_string;
    } else {
      const invoiceRes = await createStsPayment({
        external_id,
        amount: baseAmount,
        payer_email,
        description: description || 'STSPay Payment Link',
        client_name: merchantData.name || 'STS Merchant'
      });

      if (!invoiceRes.success) {
        return NextResponse.json({ success: false, message: invoiceRes.message }, { status: 500 });
      }

      paymentInfo = {
        invoice_id: invoiceRes.data?.id,
        invoice_url: invoiceRes.data?.invoice_url,
        provider: 'Xendit',
        type: 'payment_link'
      };

      responseData.checkout_url = checkout_url;
    }

    // 5. Simpan ke Firestore
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    await setDoc(transactionRef, {
      id: external_id,
      amount: baseAmount,
      status: 'PENDING',
      payerEmail: payer_email,
      description: description || 'STSPay Payment',
      userId: merchantUid,
      type: 'payment',
      mode: type,
      callbackUrl: callbackUrl || null,
      payment_info: paymentInfo,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('API Create Payment Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}
