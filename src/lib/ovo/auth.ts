'use server';
/**
 * @fileOverview Library Autentikasi OVO (2FA & PIN).
 * Dilengkapi dengan validasi tipe konten respon.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

/**
 * Tahap 1: Request OTP OVO (2FA)
 */
export async function requestOvoLogin(params: { phone: string; channel?: 'WHATSAPP' | 'SMS' }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        phone: params.phone,
        channel: params.channel || 'WHATSAPP'
      }),
      signal: AbortSignal.timeout(15000),
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: 'Server OVO Bridge mengembalikan format tidak valid (HTML/Text). Pastikan rute API benar.' };
    }

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message || 'Gagal menghubungi server auth OVO.' };
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret_key: OVO_BRIDGE_KEY,
        ...params
      }),
      signal: AbortSignal.timeout(15000),
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
