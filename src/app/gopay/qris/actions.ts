'use server';
/**
 * @fileOverview Server Action untuk menghasilkan QRIS dinamis.
 */

import { generateQrisDataUri } from "@/lib/qris/dynamic";

export async function generateDynamicQrisAction(qrisBase: string, nominal: string) {
  try {
    if (!qrisBase) throw new Error("Base QRIS tidak ditemukan dalam pengaturan akun Anda.");
    if (!nominal || isNaN(Number(nominal))) throw new Error("Nominal tidak valid.");

    const dataUri = await generateQrisDataUri(qrisBase, nominal);
    
    return {
      success: true,
      dataUri,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghasilkan QRIS dinamis."
    };
  }
}
