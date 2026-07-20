'use server';
/**
 * @fileOverview Library untuk mengambil data mutasi QR Orderkuota secara real-time.
 * Dioptimalkan dengan timeout yang lebih cepat untuk mencegah UI hang.
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
 * Timeout dikurangi menjadi 8 detik agar sistem tetap responsif.
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
      // Timeout dipercepat menjadi 8 detik agar tidak menunggu terlalu lama
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { status: false, message: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching Orderkuota mutation:', error);
    return { 
      status: false, 
      message: 'Server Lambat: Gagal mengambil mutasi. Silakan coba lagi dalam beberapa saat.' 
    };
  }
}
