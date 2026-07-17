'use server';
/**
 * @fileOverview Webhook Dispatcher Engine.
 * Menangani pengiriman notifikasi dari platform STS ke URL merchant secara aman.
 * Mendukung URL dinamis (overrideUrl) dari request header.
 */

import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import crypto from 'crypto';

/**
 * Mengirimkan data webhook ke merchant dan menandatanganinya dengan HMAC SHA256.
 * @param userId ID Merchant
 * @param payload Data yang akan dikirim
 * @param overrideUrl URL opsional yang dikirim via header (callback dinamis)
 */
export async function notifyMerchant(userId: string, payload: any, overrideUrl?: string) {
  try {
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return { success: false, message: 'Merchant not found' };
    
    const userData = userSnap.data();
    
    // Tentukan target URL: Prioritas overrideUrl (header) > userData.webhookUrl (dashboard)
    const targetUrl = overrideUrl || userData.webhookUrl;

    // Jika tidak ada URL sama sekali atau webhook dinonaktifkan di DB (hanya berlaku jika pakai URL DB)
    if (!targetUrl || (userData.webhookEnabled === false && !overrideUrl)) {
      return { success: false, message: 'No valid webhook URL found or webhook disabled' };
    }

    // Gunakan webhookSecret jika ada, jika tidak gunakan secretKey sebagai fallback untuk signing
    const secret = userData.webhookSecret || userData.secretKey;
    const body = JSON.stringify(payload);
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const response = await fetch(targetUrl, {
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
      message: `Webhook sent to ${targetUrl}`
    };
  } catch (error: any) {
    console.error(`Webhook Error [User: ${userId}]:`, error.message);
    return { success: false, message: error.message };
  }
}
