'use server';
/**
 * @fileOverview Library untuk mengambil mutasi terproses dari GoBiz.
 * Data sudah dikonversi ke Rupiah dan status yang bersih.
 */

import { GOMERCHANT_API_KEY } from './init';

export interface GoMerchantMutationInput {
  access_token: string;
  refresh_token: string;
  x_uniqueid: string;
  merchant_id?: string;
  limit?: number;
}

export interface GoMerchantMutationItem {
  trx_id: string;
  merchant_id: string;
  customer_name: string | null;
  amount: number;
  status: string;
  created_at: string;
}

export interface GoMerchantMutationResponse {
  status: string;
  data?: {
    merchant_id?: string;
    mutations: GoMerchantMutationItem[];
    token_refreshed: boolean;
    new_access_token?: string;
    new_refresh_token?: string;
  };
  message?: string;
}

/**
 * BRIDGE API: Ambil mutasi terproses.
 * Mengakses data jurnal transaksi yang sudah dikonversi ke Rupiah dan status yang bersih. 
 * API ini mendukung Auto-Refresh otomatis.
 */
export async function getGoMerchantMutations(input: GoMerchantMutationInput): Promise<GoMerchantMutationResponse> {
  const url = 'https://api.gomerchant.biz.id/v1/mutations';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apikey: GOMERCHANT_API_KEY,
        access_token: input.access_token,
        refresh_token: input.refresh_token,
        x_uniqueid: input.x_uniqueid,
        merchant_id: input.merchant_id,
        limit: input.limit || 20,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { 
        status: 'error', 
        message: `API Error (${response.status}): ${errorText || 'Gagal mengambil mutasi.'}` 
      };
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching GoMerchant mutations:', error);
    return { 
      status: 'error', 
      message: error.message || 'Terjadi kesalahan koneksi saat mengambil mutasi.' 
    };
  }
}
