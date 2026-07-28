'use server';
/**
 * @fileOverview Library Autentikasi OVO (2FA & PIN).
 * Terintegrasi dengan STSPoint Infrastructure v1.2.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'stspointkey': OVO_BRIDGE_KEY,
  'User-Agent': 'STSPoint-Infrastructure/1.2'
};

/**
 * Tahap 1: Request OTP OVO (2FA)
 */
export async function requestOvoLogin(params: { phone: string; channel?: 'WHATSAPP' | 'SMS' }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/auth/login`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        phone: params.phone,
        channel: params.channel || 'WHATSAPP'
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Bridge mengembalikan format non-JSON (HTML/Text). Pastikan URL endpoint benar.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: `Koneksi Gagal: ${error.message}` };
  }
}

/**
 * Tahap 2: Verifikasi Kode OTP
 */
export async function verifyOvoOtp(params: { 
  phone: string; 
  otp: string; 
  refId: string; 
  deviceId: string 
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Respon verifikasi OTP bukan JSON valid.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Tahap 3: Verifikasi PIN & Dapatkan Sesi Token
 */
export async function verifyOvoPin(params: {
  phone: string;
  pin: string;
  otpToken: string;
  refId: string;
  deviceId: string;
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/auth/pin`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Respon verifikasi PIN bukan JSON valid.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
