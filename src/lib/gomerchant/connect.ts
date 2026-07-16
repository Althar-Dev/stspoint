'use server';
/**
 * @fileOverview Library untuk tahap pertama koneksi GoMerchant (Login/Request OTP).
 */

import { GOMERCHANT_API_KEY } from './init';

export interface GoMerchantLoginInput {
  phone_number: string;
}

export interface GoMerchantLoginResponse {
  status: string;
  data?: {
    requires_otp: boolean;
    otp_token: string;
    otp_length: number;
    x_uniqueid: string;
  };
  message?: string;
}

/**
 * BRIDGE API: Request OTP GoBiz.
 * Menggunakan endpoint publik api.gomerchant.biz.id.
 */
export async function requestGoMerchantOtp(input: GoMerchantLoginInput): Promise<GoMerchantLoginResponse> {
  const url = 'https://api.gomerchant.biz.id/v1/login';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: GOMERCHANT_API_KEY,
        phone_number: input.phone_number,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        message: `API Error (${response.status}): ${errorText || 'Gagal menghubungi server GoMerchant.'}` 
      };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error requesting GoMerchant OTP:', error);
    return { 
      status: 'error', 
      message: error.message || 'Terjadi kesalahan koneksi ke API GoMerchant.' 
    };
  }
}
