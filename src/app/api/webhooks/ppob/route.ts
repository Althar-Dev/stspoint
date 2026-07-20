import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { doc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { notifyMerchant } from '@/lib/webhook-sender';

/**
 * API: PPOB Callback Listener (Incoming from Provider)
 * URL: /api/webhooks/ppob
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Incoming PPOB Webhook:', JSON.stringify(body, null, 2));

    const ref_id = body.refID || body.ref_id || body.reference;
    const status = body.status; 
    const message = body.message || body.msg;
    const sn = body.sn || body.serial_number;

    if (!ref_id) {
      return NextResponse.json({ status: 'error', message: 'Missing refID' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const txRef = doc(firestore, 'transactions', ref_id);
    const txSnap = await getDoc(txRef);

    if (!txSnap.exists()) {
      return NextResponse.json({ status: 'error', message: 'Transaction not found' }, { status: 404 });
    }

    const txData = txSnap.data();

    let internalStatus = 'Pending';
    const rawStatus = String(status).toUpperCase();
    if (rawStatus.includes('SUKSES') || rawStatus.includes('SUCCESS')) internalStatus = 'Success';
    if (rawStatus.includes('GAGAL') || rawStatus.includes('FAILED')) internalStatus = 'Failed';

    // REFUND LOGIC: If Failed and not already refunded
    if (internalStatus === 'Failed' && !txData.refunded && txData.priceAmount > 0) {
      await updateDoc(doc(firestore, 'users', txData.userId), {
        balance: increment(txData.priceAmount),
        updatedAt: serverTimestamp()
      });
      
      await updateDoc(txRef, {
        status: internalStatus,
        sn: sn || null,
        provider_msg: message,
        refunded: true,
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(txRef, {
        status: internalStatus,
        sn: sn || null,
        provider_msg: message,
        updatedAt: serverTimestamp()
      });
    }

    // Send Webhook to Merchant
    await notifyMerchant(txData.userId, {
      event: 'ppob.status_update',
      data: {
        ref_id: ref_id,
        sku: txData.sku,
        target: txData.target,
        status: internalStatus,
        sn: sn || null,
        message: message,
        timestamp: new Date().toISOString()
      }
    }, txData.callbackUrl);

    return NextResponse.json({ status: 'OK' });

  } catch (error: any) {
    console.error('PPOB Webhook Handler Error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
}
