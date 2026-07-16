'use server';
/**
 * @fileOverview Library untuk membuat Invoice (Tagihan) di STSPay menggunakan Xendit.
 */

import { getXenditHeaders } from './init';

export interface CreatePaymentInput {
  external_id: string; // ID unik transaksi di sistem STSPay (misal: INV-2024-001)
  amount: number;
  payer_email: string;
  description: string;
  client_name: string; // Nama merchant (User STSPay)
  callback_url?: string; // URL redirect setelah bayar
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  status: string; // PENDING, SETTLED, PAID, EXPIRED
  merchant_name: string;
  amount: number;
  payer_email: string;
  expiry_date: string;
  invoice_url: string;
  currency: string;
}

/**
 * Fungsi untuk membuat Invoice Xendit V2.
 * Mendukung otomatis: QRIS, VA (BCA, BNI, BRI, Mandiri), E-Wallet (OVO, Dana, LinkAja), dan Retail.
 */
export async function createStsPayment(input: CreatePaymentInput): Promise<{ success: boolean; data?: XenditInvoiceResponse; message?: string }> {
  const url = 'https://api.xendit.co/v2/invoices';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getXenditHeaders(),
      body: JSON.stringify({
        external_id: input.external_id,
        amount: input.amount,
        payer_email: input.payer_email,
        description: input.description,
        success_redirect_url: input.callback_url,
        failure_redirect_url: input.callback_url,
        currency: 'IDR',
        reminder_time: 1,
        metadata: {
          sts_platform: 'STSPay',
          merchant_owner: input.client_name
        }
      }),
      // Xendit merekomendasikan timeout yang cukup karena proses pembuatan VA terkadang memakan waktu
      signal: AbortSignal.timeout(20000),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || `Xendit Error (${response.status}): Gagal membuat invoice.` 
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('STSPay Create Payment Error:', error);
    return { success: false, message: 'Gagal terhubung ke Xendit. Periksa koneksi internet server.' };
  }
}
