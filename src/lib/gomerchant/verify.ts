'use server';
/**
 * @fileOverview Library untuk tahap kedua koneksi GoMerchant (Verifikasi OTP).
 */

import { GOMERCHANT_API_KEY } from './init';

export interface GoMerchantVerifyInput {
  otp_code: string;
  otp_token: string;
  x_uniqueid: string;
}

export interface GoMerchantVerifyResponse {
  status: string;
  data?: {
    access_token: string;
    refresh_token: string;
    x_uniqueid: string;
  };
  message?: string;
}

/**
 * BRIDGE API: Verifikasi OTP GoBiz.
 * Menggunakan endpoint publik api.gomerchant.biz.id.
 */
export async function verifyGoMerchantOtp(input: GoMerchantVerifyInput): Promise<GoMerchantVerifyResponse> {
  const url = 'https://api.gomerchant.biz.id/v1/verify';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: GOMERCHANT_API_KEY,
        otp_code: input.otp_code,
        otp_token: input.otp_token,
        x_uniqueid: input.x_uniqueid,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        message: `API Error (${response.status}): ${errorText || 'Gagal memverifikasi OTP.'}` 
      };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error verifying GoMerchant OTP:', error);
    return { 
      status: 'error', 
      message: error.message || 'Terjadi kesalahan saat memverifikasi kode OTP.' 
    };
  }
}
