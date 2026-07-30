'use server';
/**
 * @fileOverview Library Autentikasi OVO (Login 3 Tahap).
 * Patuh pada Dokumentasi OVO Native Microservice API.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'stspointkey': OVO_BRIDGE_KEY,
  'User-Agent': 'STSPoint-Infrastructure/1.2'
};

/**
 * Step 1: Request Kode OTP (2FA)
 */
export async function requestOvoLogin(params: { phone: string; deviceId?: string; channel?: 'WHATSAPP' | 'SMS' }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/auth/login-2fa`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({
        phone: params.phone,
        deviceId: params.deviceId || "",
        channel: params.channel || 'WHATSAPP'
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: `Koneksi Gagal: ${error.message}` };
  }
}

/**
 * Step 2: Verifikasi Kode OTP
 */
export async function verifyOvoOtp(params: { 
  refId: string; 
  otp: string;
  phone: string;
  deviceId: string;
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Step 3: Masukkan PIN OVO (Security Code)
 */
export async function verifyOvoPin(params: {
  pin: string;
  otpToken: string;
  phone: string;
  refId: string;
  deviceId: string;
}) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/auth/security-code`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Verifikasi Token Tersimpan
 */
export async function directTokenLogin(token: string) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/auth/direct-token`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
