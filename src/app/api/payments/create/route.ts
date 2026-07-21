import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { createXenditPaymentRequest } from '@/lib/xendit/payment-request';

/**
 * Helper: Kalkulasi fee (Merchant Borne)
 */
function calculateFee(base: number, feeStr: string | undefined) {
  if (!feeStr) return 0;
  if (feeStr.includes('%')) {
    return Math.ceil(base * (parseFloat(feeStr) / 100));
  }
  const numericFee = parseInt(feeStr.replace(/[^0-9]/g, ''));
  return isNaN(numericFee) ? 0 : numericFee;
}

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

    // 3. Persiapkan Identitas Transaksi
    const external_id = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    const host = request.headers.get('host') || 'stspoint.id';
    const isDev = host.includes('localhost') || host.includes('cloudworkstations.dev') || host.includes('firebaseapp.com');
    const checkout_url = isDev 
      ? `http://${host}/checkout/${external_id}`
      : `https://checkout.stspoint.id/${external_id}`;

    let responseData: any = {
      external_id,
      status: 'PENDING',
      amount: baseAmount
    };

    let paymentInfo: any = null;
    let feeAmount = 0;

    // 4. Handle direct QRIS (MDR Check)
    if (type === 'qris') {
      const qrisChannelRef = doc(firestore, 'payment_channels', 'QRIS');
      const qrisSnap = await getDoc(qrisChannelRef);
      const qrisConfig = qrisSnap.exists() ? qrisSnap.data() : { fee: '0.7%' }; 
      
      feeAmount = calculateFee(baseAmount, qrisConfig.fee);

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
      responseData.checkout_url = checkout_url;
    }

    // 5. Simpan ke Firestore (Record ke STSPay Transactions DAN Global Transactions Ledger)
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const globalHistoryRef = doc(firestore, 'transactions', external_id);
    const userHistoryRef = doc(firestore, 'users', merchantUid, 'transactions', external_id);

    const mainTxData = {
      id: external_id,
      amount: baseAmount, 
      base_amount: baseAmount,
      fee_amount: feeAmount,
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
    };

    const historyData = {
      id: external_id,
      gameId: "STSPAY",
      gameName: "STSPAY",
      itemName: description || "Payment Request",
      price: `Rp ${baseAmount.toLocaleString('id-ID')}`,
      priceAmount: baseAmount,
      userId: merchantUid,
      payerEmail: payer_email,
      status: "Pending", // Consistent with Dashboard expectation
      paymentMethod: type === 'qris' ? "QRIS" : "Checkout Link",
      createdAt: serverTimestamp()
    };

    await Promise.all([
      setDoc(transactionRef, mainTxData),
      setDoc(globalHistoryRef, historyData),
      setDoc(userHistoryRef, historyData)
    ]);

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('API Create Payment Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}