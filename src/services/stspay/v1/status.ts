'use server';
/**
 * @fileOverview STSPay Engine V1 - Check & Sync Status (Server Side)
 * Hanya menangani pengambilan data terbaru dari Xendit.
 */

import { getStsPaymentStatus } from "@/lib/xendit/status";

/**
 * Mengambil status terbaru transaksi dari Xendit.
 * Pembaruan status di Firestore harus dilakukan di sisi klien 
 * untuk menjaga izin akses pengguna.
 */
export async function fetchStsInvoiceStatus(invoiceId: string) {
  try {
    const xenditRes = await getStsPaymentStatus(invoiceId);

    if (!xenditRes.success || !xenditRes.data) {
      throw new Error(xenditRes.message || "Gagal mengambil status dari Xendit.");
    }

    return {
      success: true,
      status: xenditRes.data.status,
      amount: xenditRes.data.amount,
      payerEmail: xenditRes.data.payer_email
    };

  } catch (error: any) {
    console.error("STSPay V1 Status Fetch Error:", error);
    return {
      success: false,
      message: error.message || "Gagal mengambil status terbaru."
    };
  }
}
