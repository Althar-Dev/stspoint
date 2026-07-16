'use server';
/**
 * @fileOverview Library untuk mengambil data mutasi QR Orderkuota secara real-time.
 * Data ini tidak disimpan ke database internal sesuai instruksi.
 */

import { STS_POINT_API_KEY } from './init';

export interface OrderkuotaMutationItem {
  id: number;
  debet: string;
  kredit: string;
  saldo_akhir: string;
  keterangan: string;
  tanggal: string;
  status: string;
  fee: string;
  brand: {
    name: string;
    logo: string;
  };
}

export interface OrderkuotaMutationResponse {
  status: boolean;
  creator?: string;
  result?: OrderkuotaMutationItem[];
  message?: string;
}

export interface GetMutationInput {
  username: string;
  token: string;
}

/**
 * Mengambil data mutasi QR dari API Orderkuota menggunakan Master Key STSPoint.
 * Digunakan untuk menampilkan log transaksi secara live di dashboard.
 */
export async function getOrderkuotaMutation(input: GetMutationInput): Promise<OrderkuotaMutationResponse> {
  const { username, token } = input;
  const url = `https://api.qrispay.biz.id/orderkuota/mutasiqr?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      return { status: false, message: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching Orderkuota mutation:', error);
    // Return graceful error object instead of throwing TypeError
    return { 
      status: false, 
      message: 'Endpoint Maintenance: Gagal mengambil mutasi dari Orderkuota.' 
    };
  }
}
