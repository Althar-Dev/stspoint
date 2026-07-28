'use server';
/**
 * @fileOverview Library Transfer Saldo OVO & Rekening Bank.
 * Dilengkapi dengan validasi tipe konten respon.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

interface OVOBaseParams {
  token: string;
  deviceId: string;
}

/**
 * Validasi Nomor HP Sesama OVO
 */
export async function checkOvoNumber(params: OVOBaseParams & { phone: string; amount: number }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/transfer/check-ovo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal cek nomor OVO: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Eksekusi Transfer Sesama OVO
 */
export async function transferToOvo(params: OVOBaseParams & { phone: string; amount: number; message?: string }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/transfer/ovo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(30000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal transfer OVO: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Mengambil Daftar Kode Bank Master
 */
export async function getOvoBankList(params: OVOBaseParams) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/transfer/banks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal ambil daftar bank: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Inquiry Rekening Bank (Cek Nama Pemilik)
 */
export async function bankInquiry(params: OVOBaseParams & { 
  accountNo: string; 
  bankCode: string; 
  bankName: string; 
  amount: number; 
  message?: string 
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/transfer/bank-inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(20000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal inquiry bank: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Eksekusi Transfer ke Rekening Bank
 */
export async function transferToBank(params: OVOBaseParams & {
  accountName: string;
  accountNo: string;
  accountNoDestination: string;
  amount: number;
  bankCode: string;
  bankName: string;
  message?: string;
  notes?: string;
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/transfer/bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(30000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal transfer bank: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
