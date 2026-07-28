'use server';
/**
 * @fileOverview Library Pengambilan Data Akun OVO (Mutasi, Saldo, Profil).
 * Dilengkapi dengan validasi tipe konten respon.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

interface OVODataParams {
  token: string;
  deviceId: string;
}

/**
 * Menarik data mutasi transaksi OVO
 */
export async function getOvoMutations(params: OVODataParams & { page?: number; limit?: number }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/mutasi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal menarik data mutasi: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Mengambil Saldo OVO Cash & Point
 */
export async function getOvoBalance(params: OVODataParams) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal cek saldo: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Mengambil Data Profil Akun
 */
export async function getOvoProfile(params: OVODataParams) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Gagal ambil profil: Respon server bukan JSON.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
