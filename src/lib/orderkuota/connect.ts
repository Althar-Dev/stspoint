'use server';
/**
 * @fileOverview Library untuk proses koneksi dua tahap Orderkuota.
 * Menggunakan STS_POINT_API_KEY internal sebagai bridge.
 */

import { STS_POINT_API_KEY } from './init';

export interface GetOtpInput {
  username: string;
  password?: string;
}

export interface GetOtpResponse {
  status: boolean;
  creator?: string;
  result?: {
    otp: string;
    otp_value: string;
  };
  message?: string;
}

export interface GetTokenInput {
  username: string;
  otp: string;
}

export interface GetTokenResponse {
  status: boolean;
  creator?: string;
  result?: {
    id: string;
    name: string;
    username: string;
    balance: string;
    token: string;
  };
  message?: string;
}

/**
 * Tahap 1: Meminta OTP ke API Orderkuota menggunakan Master Key STSPoint.
 */
export async function requestOrderkuotaOtp(input: GetOtpInput): Promise<GetOtpResponse> {
  const { username, password = '' } = input;
  const url = `https://api.qrispay.biz.id/orderkuota/getotp?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      return { status: false, message: `Server error: ${response.status}` };
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error requesting OTP:', error);
    return { status: false, message: 'Gagal terhubung ke gateway Orderkuota.' };
  }
}

/**
 * Tahap 2: Menukarkan OTP dengan Token permanen menggunakan Master Key STSPoint.
 */
export async function getOrderkuotaToken(input: GetTokenInput): Promise<GetTokenResponse> {
  const { username, otp } = input;
  const url = `https://api.qrispay.biz.id/orderkuota/gettoken?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&otp=${encodeURIComponent(otp)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) {
      return { status: false, message: `Server error: ${response.status}` };
    }
    return await response.json();
  } catch (error: any) {
    console.error('Error exchanging OTP for Token:', error);
    return { status: false, message: 'Gagal memverifikasi token Orderkuota.' };
  }
}
