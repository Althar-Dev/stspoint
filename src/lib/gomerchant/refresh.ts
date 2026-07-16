'use server';
/**
 * @fileOverview Library untuk merefresh access token GoMerchant menggunakan refresh token.
 */

import { GOMERCHANT_API_KEY } from './init';

export interface GoMerchantRefreshInput {
  refresh_token: string;
  x_uniqueid: string;
}

export interface GoMerchantRefreshResponse {
  status: string;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    x_uniqueid: string;
  };
}

/**
 * BRIDGE API: Refresh Access Token.
 * Menukarkan refresh_token lama menjadi access_token baru jika token lama sudah kadaluarsa.
 */
export async function refreshGoMerchantToken(input: GoMerchantRefreshInput): Promise<GoMerchantRefreshResponse> {
  const url = 'https://api.gomerchant.biz.id/v1/refresh';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: GOMERCHANT_API_KEY,
        refresh_token: input.refresh_token,
        x_uniqueid: input.x_uniqueid,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        message: `API Error (${response.status}): ${errorText || 'Gagal merefresh token.'}` 
      };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error refreshing GoMerchant token:', error);
    return { 
      status: 'error', 
      message: error.message || 'Terjadi kesalahan koneksi saat merefresh token.' 
    };
  }
}
