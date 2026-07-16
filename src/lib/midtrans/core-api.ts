'use server';
/**
 * @fileOverview Library untuk berinteraksi dengan Midtrans Core API.
 * Mendukung Bank Transfer, E-Wallet, dan QRIS.
 */

import { getMidtransHeaders, MIDTRANS_BASE_URL } from './init';

export interface MidtransChargeInput {
  payment_type: 'bank_transfer' | 'gopay' | 'shopeepay' | 'qris' | 'echannel' | 'cstore';
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details?: {
    id?: string;
    price: number;
    quantity: number;
    name: string;
  }[];
  customer_details?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  };
  // Konfigurasi Virtual Account
  bank_transfer?: {
    bank: 'bca' | 'bni' | 'bri' | 'permata' | 'cimb';
    va_number?: string; // Optional kustom VA
    free_text?: {
      inquiry?: { id: string; en: string }[];
      payment?: { id: string; en: string }[];
    };
  };
  // Konfigurasi Mandiri Bill (E-Channel)
  echannel?: {
    bill_info1: string;
    bill_info2: string;
  };
  // Konfigurasi GoPay
  gopay?: {
    enable_callback?: boolean;
    callback_url?: string;
  };
  // Konfigurasi ShopeePay
  shopeepay?: {
    callback_url?: string;
  };
  // Konfigurasi QRIS
  qris?: {
    acquirer?: 'gopay' | 'airpay' | 'total_it';
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
  metadata?: Record<string, any>;
}

/**
 * Membuat transaksi (Charge) baru di Midtrans.
 */
export async function chargeMidtrans(input: MidtransChargeInput) {
  const url = `${MIDTRANS_BASE_URL}/charge`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getMidtransHeaders(),
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.error_messages?.[0] || result.message || `Midtrans Error (${response.status})` 
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Midtrans Charge Error:', error);
    return { success: false, message: 'Gagal terhubung ke Midtrans API.' };
  }
}

/**
 * Mengecek status transaksi berdasarkan Order ID.
 */
export async function getMidtransStatus(orderId: string) {
  const url = `${MIDTRANS_BASE_URL}/${orderId}/status`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getMidtransHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.message || 'Data transaksi tidak ditemukan.' };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Midtrans Status Check Error:', error);
    return { success: false, message: 'Gagal sinkronisasi status Midtrans.' };
  }
}

/**
 * Membatalkan transaksi yang belum dibayar.
 */
export async function cancelMidtransTransaction(orderId: string) {
  const url = `${MIDTRANS_BASE_URL}/${orderId}/cancel`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getMidtransHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error: any) {
    console.error('Midtrans Cancel Error:', error);
    return { success: false, message: 'Gagal membatalkan transaksi.' };
  }
}

/**
 * Memaksa transaksi untuk segera kedaluwarsa.
 */
export async function expireMidtransTransaction(orderId: string) {
  const url = `${MIDTRANS_BASE_URL}/${orderId}/expire`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getMidtransHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error: any) {
    console.error('Midtrans Expire Error:', error);
    return { success: false, message: 'Gagal mengatur kadaluarsa transaksi.' };
  }
}
