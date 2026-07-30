'use server';
/**
 * @fileOverview Library Pengambilan Data Akun OVO (Mutasi, Saldo, Profil).
 * Menggunakan Header Authentication sesuai Dokumentasi v1.2.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

function getHeaders(token: string, deviceId: string) {
  return {
    'Content-Type': 'application/json',
    'x-ovo-token': token,
    'x-device-id': deviceId,
    'stspointkey': OVO_BRIDGE_KEY,
    'User-Agent': 'STSPoint-Infrastructure/1.2'
  };
}

/**
 * GET /api/account/transactions
 */
export async function getOvoMutations(params: { token: string; deviceId: string; page?: number; limit?: number }) {
  try {
    const query = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString()
    });

    const response = await fetch(`${OVO_BRIDGE_URL}/account/transactions?${query}`, {
      method: 'GET',
      headers: getHeaders(params.token, params.deviceId),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * GET /api/account/balance
 */
export async function getOvoBalance(params: { token: string; deviceId: string }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/account/balance`, {
      method: 'GET',
      headers: getHeaders(params.token, params.deviceId),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * GET /api/account/profile
 */
export async function getOvoProfile(params: { token: string; deviceId: string }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/account/profile`, {
      method: 'GET',
      headers: getHeaders(params.token, params.deviceId),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
