'use server';
/**
 * @fileOverview Library untuk berinteraksi dengan Xendit Payment Requests API (v3).
 * Berdasarkan: https://docs.xendit.co/apidocs/create-payment-request
 */

import { getXenditHeaders } from './init';

export type PaymentMethodType = 'VIRTUAL_ACCOUNT' | 'QR_CODE' | 'EWALLET' | 'OVER_THE_COUNTER' | 'CARD' | 'DIRECT_DEBIT' | 'PAYLATER';
export type EWalletChannel = 'OVO' | 'DANA' | 'SHOPEEPAY' | 'LINKAJA' | 'ASTRAPAY' | 'JENIUSPAY';
export type VAChannel = 'BCA' | 'BNI' | 'BRI' | 'MANDIRI' | 'PERMATA' | 'BSI' | 'CIMB' | 'SAHABAT_SAMPOERNA' | 'BJB';
export type RetailChannel = 'ALFAMART' | 'INDOMARET';
export type PaylaterChannel = 'AKULAKU' | 'KREDIVO';

interface CreatePaymentRequestInput {
  reference_id: string;
  amount: number;
  currency: 'IDR';
  country?: 'ID';
  description?: string;
  payment_method: {
    type: PaymentMethodType;
    reusability: 'ONE_TIME_USE' | 'MULTIPLE_USE';
    virtual_account?: {
      channel_code: VAChannel;
      channel_properties: {
        customer_name: string;
        expires_at?: string;
      };
    };
    qr_code?: {
      channel_code?: 'QRIS';
      channel_properties?: {
        expires_at?: string;
      };
    };
    ewallet?: {
      channel_code: EWalletChannel;
      channel_properties: {
        success_return_url: string;
        mobile_number?: string;
      };
    };
    over_the_counter?: {
      channel_code: RetailChannel;
      channel_properties: {
        customer_name: string;
        expires_at?: string;
      };
    };
    paylater?: {
      channel_code: PaylaterChannel;
    };
  };
  metadata?: Record<string, any>;
}

/**
 * Buat Payment Request Baru (V3)
 */
export async function createXenditPaymentRequest(input: CreatePaymentRequestInput) {
  const url = 'https://api.xendit.co/payment_requests';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getXenditHeaders(),
      body: JSON.stringify({
        ...input,
        country: input.country || 'ID',
      }),
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || `Xendit Error (${response.status})`);

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Xendit Create PR Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Cek Status Payment Request (V3)
 * Dok: https://docs.xendit.co/apidocs/get-payment-request
 */
export async function getXenditPaymentRequest(id: string) {
  const url = `https://api.xendit.co/payment_requests/${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getXenditHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal mendapatkan data status.');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Xendit Get PR Error:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Batalkan / Matikan Payment Request (Expire)
 * Dok: https://docs.xendit.co/apidocs/cancel-payment-request
 */
export async function expireXenditPaymentRequest(id: string) {
  const url = `https://api.xendit.co/payment_requests/${id}/expire`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getXenditHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal membatalkan transaksi di Xendit.');

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Xendit Expire PR Error:', error);
    return { success: false, message: error.message };
  }
}
