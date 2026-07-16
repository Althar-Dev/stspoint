'use server';
/**
 * @fileOverview STSPay Engine V1 - Create Payment (Server Side)
 * Menangani komunikasi sensitif dengan API Xendit.
 */

import { createStsPayment, type XenditInvoiceResponse } from "@/lib/xendit/create";

export interface CreateStsTransactionInput {
  userId: string;
  amount: number;
  payerEmail: string;
  description: string;
  clientName: string;
}

/**
 * Membuat transaksi pembayaran STSPay.
 * Hanya menangani pembuatan invoice di Xendit. 
 * Pencatatan ke Firestore dilakukan di sisi klien untuk menjaga konteks autentikasi.
 */
export async function createStsTransaction(input: CreateStsTransactionInput) {
  const { amount, payerEmail, description, clientName } = input;

  // 1. Buat External ID unik untuk pelacakan
  const externalId = `STS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    // 2. Panggil Xendit Bridge
    const xenditRes = await createStsPayment({
      external_id: externalId,
      amount,
      payer_email: payerEmail,
      description,
      client_name: clientName,
    });

    if (!xenditRes.success || !xenditRes.data) {
      throw new Error(xenditRes.message || "Gagal membuat invoice di Xendit.");
    }

    const invoice: XenditInvoiceResponse = xenditRes.data;

    return {
      success: true,
      externalId,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      amount: invoice.amount,
      status: invoice.status,
      payerEmail: invoice.payer_email,
      description: invoice.description
    };

  } catch (error: any) {
    console.error("STSPay V1 Create Error:", error);
    return {
      success: false,
      message: error.message || "Terjadi kesalahan internal pada sistem STSPay."
    };
  }
}
