'use server';
/**
 * @fileOverview Server Action untuk membatalkan (expire) transaksi STSPay secara resmi.
 */

import { expireXenditPaymentRequest } from "@/lib/xendit/payment-request";
import { cancelMidtransTransaction } from "@/lib/midtrans/core-api";

export async function cancelStsTransaction(paymentRequestId: string, provider: string = 'Xendit') {
  try {
    if (!paymentRequestId) throw new Error("ID Transaksi tidak valid.");

    let res;
    if (provider === 'Midtrans') {
      res = await cancelMidtransTransaction(paymentRequestId);
    } else {
      res = await expireXenditPaymentRequest(paymentRequestId);
    }

    if (res.success) {
      return { success: true, message: "Transaksi berhasil dibatalkan." };
    }

    throw new Error(res.message || "Gagal memproses pembatalan di provider.");
  } catch (error: any) {
    console.error("Cancel Service Error:", error);
    return { success: false, message: error.message };
  }
}
