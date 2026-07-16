'use server';
/**
 * @fileOverview Library untuk melakukan penarikan saldo (Withdrawal) QR Orderkuota.
 * Menggunakan STS_POINT_API_KEY internal sebagai bridge.
 */

import { STS_POINT_API_KEY } from './init';

export interface WithdrawInput {
  username: string;
  token: string;
  amount: number;
}

export interface WithdrawResponse {
  status: boolean;
  creator?: string;
  result?: {
    success: boolean;
    qris_withdraw: {
      success: boolean;
      message: string;
    };
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

/**
 * Melakukan penarikan saldo QR ke saldo utama Orderkuota menggunakan Master Key STSPoint.
 */
export async function orderkuotaWithdraw(input: WithdrawInput): Promise<WithdrawResponse> {
  const { username, token, amount } = input;
  const url = `https://api.qrispay.biz.id/orderkuota/wdqr?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}&amount=${amount}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
       return { status: false, message: `HTTP error! status: ${response.status}` };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error during Orderkuota withdrawal:', error);
    return { status: false, message: 'Gagal melakukan withdrawal: Koneksi terputus.' };
  }
}
