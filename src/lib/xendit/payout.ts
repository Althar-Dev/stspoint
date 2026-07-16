'use server';
/**
 * @fileOverview Library untuk pengiriman dana (Disbursement) STSPay melalui Xendit.
 */

import { getXenditHeaders } from './init';

export interface CreatePayoutInput {
  external_id: string; // ID unik penarikan (misal: WD-8312)
  amount: number;
  bank_code: string; // Kode bank (BCA, BNI, MANDIRI, BRI, dll)
  account_holder_name: string;
  account_number: string;
  description: string;
}

export interface XenditDisbursementResponse {
  id: string;
  external_id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  bank_code: string;
  account_holder_name: string;
  disbursement_description: string;
  failure_code?: string;
}

/**
 * Fungsi untuk memproses penarikan dana ke rekening bank.
 * Menggunakan saldo Xendit Platform (STSPay) untuk dikirim ke user.
 */
export async function createStsPayout(input: CreatePayoutInput): Promise<{ success: boolean; data?: XenditDisbursementResponse; message?: string }> {
  const url = 'https://api.xendit.co/disbursements';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getXenditHeaders(),
        // Idempotency Key sangat penting untuk disbursement agar tidak terjadi double transfer
        // jika request dikirim ulang karena masalah koneksi.
        'X-IDEMPOTENCY-KEY': input.external_id 
      },
      body: JSON.stringify({
        external_id: input.external_id,
        amount: input.amount,
        bank_code: input.bank_code,
        account_holder_name: input.account_holder_name,
        account_number: input.account_number,
        description: input.description
      }),
      signal: AbortSignal.timeout(25000),
    });

    const result = await response.json();

    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || `Xendit Payout Error (${response.status})` 
      };
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('STSPay Payout Error:', error);
    return { success: false, message: 'Gagal memproses penarikan dana. Hubungi tim teknis STSPay.' };
  }
}
