'use server';
/**
 * @fileOverview Webhook Dispatcher Engine.
 * Menangani pengiriman notifikasi dari platform STS ke URL merchant secara aman.
 */

import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import crypto from 'crypto';

/**
 * Mengirimkan data webhook ke merchant dan menandatanganinya dengan HMAC SHA256.
 */
export async function notifyMerchant(userId: string, payload: any) {
  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return { success: false, message: 'Merchant not found' };
    
    const userData = userSnap.data();
    
    // Pastikan webhook dikonfigurasi dan aktif
    if (!userData.webhookUrl || userData.webhookEnabled === false) {
      return { success: false, message: 'Webhook disabled or not set' };
    }

    // Gunakan webhookSecret jika ada, jika tidak gunakan secretKey sebagai fallback
    const secret = userData.webhookSecret || userData.secretKey;
    const body = JSON.stringify(payload);
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const response = await fetch(userData.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-STS-Signature': signature,
        'User-Agent': 'STSPoint-Webhook-Dispatcher/1.2'
      },
      body: body,
      signal: AbortSignal.timeout(10000) // Timeout 10 detik
    });

    return { 
      success: response.ok, 
      status: response.status,
      message: `Webhook sent to ${userData.webhookUrl}`
    };
  } catch (error: any) {
    console.error(`Webhook Error [User: ${userId}]:`, error.message);
    return { success: false, message: error.message };
  }
}
