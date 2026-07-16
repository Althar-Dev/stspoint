import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

/**
 * HANDLER WEBHOOK STSPAY (Xendit & Midtrans Notification)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('STSPay Webhook Received:', JSON.stringify(body, null, 2));

    // 1. Ekstrak External ID / Order ID
    // Xendit V3: data.reference_id
    // Midtrans: order_id
    const transactionId = body?.data?.reference_id || body?.order_id || body?.external_id;
    
    if (!transactionId) {
      console.warn('Webhook warning: No ID found in payload');
      return NextResponse.json({ message: 'ID not found' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const transactionRef = doc(firestore, 'stspay_transactions', transactionId);
    
    const txSnap = await getDoc(transactionRef);
    if (!txSnap.exists()) {
      console.error(`Webhook error: Transaction ${transactionId} not found in Firestore`);
      return NextResponse.json({ message: 'Transaction record not found' }, { status: 404 });
    }

    // 2. Deteksi Status dari Provider
    let internalStatus = 'PENDING';
    
    // Deteksi Xendit V3 / V2
    const xenditStatus = body?.data?.status || body?.status;
    if (xenditStatus === 'SUCCEEDED' || xenditStatus === 'PAID' || body?.event === 'payment_request.succeeded') {
      internalStatus = 'PAID';
    } else if (xenditStatus === 'EXPIRED') {
      internalStatus = 'EXPIRED';
    } else if (xenditStatus === 'FAILED') {
      internalStatus = 'FAILED';
    }

    // Deteksi Midtrans
    const midtransStatus = body?.transaction_status;
    if (midtransStatus) {
      if (midtransStatus === 'settlement' || midtransStatus === 'capture') {
        internalStatus = 'PAID';
      } else if (midtransStatus === 'expire') {
        internalStatus = 'EXPIRED';
      } else if (midtransStatus === 'cancel' || midtransStatus === 'deny') {
        internalStatus = 'FAILED';
      }
    }

    // 3. Update Database
    await updateDoc(transactionRef, {
      status: internalStatus,
      updatedAt: serverTimestamp(),
      gateway_raw_status: xenditStatus || midtransStatus,
      last_webhook_payload: body 
    });

    console.log(`Webhook success: Transaction ${transactionId} updated to ${internalStatus}`);
    
    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook Handler Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
