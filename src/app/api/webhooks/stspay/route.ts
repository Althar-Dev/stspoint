
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { notifyMerchant } from '@/lib/webhook-sender';

/**
 * HANDLER WEBHOOK STSPAY (Incoming from Provider like Xendit)
 * Dispatches to Merchant using dynamic callbackUrl if available.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('STSPay Webhook Received:', JSON.stringify(body, null, 2));

    // 1. Ekstrak External ID / Order ID
    const transactionId = body?.data?.reference_id || body?.order_id || body?.external_id || body?.id;
    
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

    const txData = txSnap.data();

    // 2. Deteksi Status dari Provider
    let internalStatus = 'PENDING';
    const xenditStatus = body?.data?.status || body?.status;
    
    if (xenditStatus === 'SUCCEEDED' || xenditStatus === 'PAID' || body?.event === 'payment_request.succeeded') {
      internalStatus = 'PAID';
    } else if (xenditStatus === 'EXPIRED') {
      internalStatus = 'EXPIRED';
    } else if (xenditStatus === 'FAILED') {
      internalStatus = 'FAILED';
    }

    // 3. Update Database
    await updateDoc(transactionRef, {
      status: internalStatus,
      updatedAt: serverTimestamp(),
      gateway_raw_status: xenditStatus,
      last_webhook_payload: body 
    });

    // 4. Trigger Webhook to Merchant
    // Uses txData.callbackUrl (captured during creation from X-Callback-URL header)
    if (internalStatus !== 'PENDING') {
      await notifyMerchant(txData.userId, {
        event: `payment.${internalStatus.toLowerCase()}`,
        data: {
          external_id: transactionId,
          status: internalStatus,
          amount: txData.amount,
          payer_email: txData.payerEmail,
          timestamp: new Date().toISOString()
        }
      }, txData.callbackUrl);
    }

    console.log(`Webhook handled: Transaction ${transactionId} is now ${internalStatus}`);
    
    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook Handler Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
