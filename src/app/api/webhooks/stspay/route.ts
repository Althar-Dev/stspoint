import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import { notifyMerchant } from '@/lib/webhook-sender';

/**
 * HANDLER WEBHOOK STSPAY (Incoming from Provider like Xendit)
 * Dispatches to Merchant and Updates Net Balance (Merchant-Borne Fee logic).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('STSPay Webhook Received:', JSON.stringify(body, null, 2));

    const transactionId = body?.data?.reference_id || body?.order_id || body?.external_id || body?.id;
    
    if (!transactionId) {
      return NextResponse.json({ message: 'ID not found' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const transactionRef = doc(firestore, 'stspay_transactions', transactionId);
    
    const txSnap = await getDoc(transactionRef);
    if (!txSnap.exists()) {
      return NextResponse.json({ message: 'Transaction record not found' }, { status: 404 });
    }

    const txData = txSnap.data();

    // 2. Detect Status
    let internalStatus = 'PENDING';
    const xenditStatus = body?.data?.status || body?.status;
    
    if (xenditStatus === 'SUCCEEDED' || xenditStatus === 'PAID' || body?.event === 'payment_request.succeeded') {
      internalStatus = 'PAID';
    } else if (xenditStatus === 'EXPIRED') {
      internalStatus = 'EXPIRED';
    } else if (xenditStatus === 'FAILED') {
      internalStatus = 'FAILED';
    }

    // 3. Update Database & Merchant Balance (Only on transition to PAID)
    if (internalStatus === 'PAID' && txData.status !== 'PAID') {
      const netAmount = (txData.amount || 0) - (txData.fee_amount || 0);
      const merchantStsPayRef = doc(firestore, 'users', txData.userId, 'services', 'stspay');
      
      await updateDoc(merchantStsPayRef, {
        balance: increment(netAmount),
        updatedAt: serverTimestamp()
      });

      // Update Ledger Record
      const userHistoryRef = doc(firestore, 'users', txData.userId, 'transactions', transactionId);
      const globalHistoryRef = doc(firestore, 'transactions', transactionId);
      
      await Promise.all([
        updateDoc(userHistoryRef, { status: 'Success', updatedAt: serverTimestamp() }),
        updateDoc(globalHistoryRef, { status: 'Success', updatedAt: serverTimestamp() })
      ]);
    }

    await updateDoc(transactionRef, {
      status: internalStatus,
      updatedAt: serverTimestamp(),
      gateway_raw_status: xenditStatus,
      last_webhook_payload: body 
    });

    // 4. Trigger Webhook to Merchant
    if (internalStatus !== 'PENDING') {
      await notifyMerchant(txData.userId, {
        event: `payment.${internalStatus.toLowerCase()}`,
        data: {
          external_id: transactionId,
          status: internalStatus,
          amount: txData.amount,
          fee: txData.fee_amount || 0,
          net_amount: (txData.amount || 0) - (txData.fee_amount || 0),
          payer_email: txData.payerEmail,
          timestamp: new Date().toISOString()
        }
      }, txData.callbackUrl);
    }
    
    return NextResponse.json({ status: 'OK' });
  } catch (error: any) {
    console.error('Webhook Handler Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
