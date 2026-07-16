'use server';
/**
 * @fileOverview Library untuk mengambil detail pembayaran dari Xendit.
 */

import { getXenditHeaders } from './init';
import { type XenditInvoiceResponse } from './create';

/**
 * Mengambil status terbaru invoice berdasarkan ID Invoice dari Xendit.
 * Berguna untuk sinkronisasi manual jika webhook tidak terkirim.
 */
export async function getStsPaymentStatus(invoiceId: string): Promise<{ success: boolean; data?: XenditInvoiceResponse; message?: string }> {
  // Endpoint Xendit untuk mengambil invoice berdasarkan ID
  const url = `https://api.xendit.co/v2/invoices/${invoiceId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getXenditHeaders(),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || `Xendit Error (${response.status}): Data tidak ditemukan.` 
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('STSPay Get Status Error:', error);
    return { success: false, message: 'Gagal sinkronisasi status pembayaran.' };
  }
}
