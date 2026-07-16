'use server';
/**
 * @fileOverview Library untuk profil Orderkuota menggunakan Master Key STSPoint.
 */

import { STS_POINT_API_KEY } from './init';

export interface OrderkuotaProfileResponse {
  status: boolean;
  creator?: string;
  result?: {
    success: boolean;
    account: {
      success: boolean;
      results: {
        id: number;
        username: string;
        name: string;
        email: string;
        phone: string;
        balance: number;
        balance_str: string;
        qris_balance: number;
        qris_balance_str: string;
        qrcode: string;
        qris: string;
        qris_name: string;
      };
    };
  };
  message?: string;
}

export interface GetProfileInput {
  username: string;
  token: string;
}

/**
 * Mengambil data profil lengkap dari API Orderkuota menggunakan Master Key STSPoint.
 */
export async function getOrderkuotaProfile(input: GetProfileInput): Promise<OrderkuotaProfileResponse> {
  const { username, token } = input;
  const url = `https://api.qrispay.biz.id/orderkuota/profile?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { status: false, message: `Server error: ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching Orderkuota profile:', error);
    return { status: false, message: 'Gagal mengambil data profil Orderkuota.' };
  }
}
