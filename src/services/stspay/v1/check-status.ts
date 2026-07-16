'use server';
/**
 * @fileOverview Server Action untuk pengecekan status pembayaran STSPay menggunakan API Xendit V3 atau Midtrans.
 */

import { getXenditPaymentRequest } from "@/lib/xendit/payment-request";
import { getMidtransStatus } from "@/lib/midtrans/core-api";

/**
 * Mengecek status transaksi dari Provider yang sesuai
 */
export async function manualCheckPaymentStatus(paymentRequestId: string, provider: string = 'Xendit') {
  try {
    if (!paymentRequestId) throw new Error("ID Transaksi diperlukan.");

    if (provider === 'Midtrans') {
      const res = await getMidtransStatus(paymentRequestId);
      if (res.success && res.data) {
        const s = res.data.transaction_status;
        const isPaid = s === 'settlement' || s === 'capture';
        return { 
          success: true, 
          isPaid, 
          status: s.toUpperCase(), 
          rawResult: res.data 
        };
      }
      throw new Error(res.message || "Gagal sinkronisasi data dengan Midtrans.");
    }

    // Default: Xendit
    const res = await getXenditPaymentRequest(paymentRequestId);
    if (res.success && res.data) {
      const pr = res.data;
      const isPaid = pr.status === 'SUCCEEDED';
      return { 
        success: true, 
        isPaid, 
        status: pr.status, 
        rawResult: pr 
      };
    }

    throw new Error(res.message || "Gagal sinkronisasi data dengan Xendit.");
  } catch (error: any) {
    console.error('Manual Check Status Error:', error);
    return { 
      success: false, 
      message: error.message || 'Gagal melakukan verifikasi status.' 
    };
  }
}
