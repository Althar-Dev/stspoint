'use server';
/**
 * @fileOverview Library untuk menarik data mutasi transaksi dari ShopeePay Merchant Portal.
 */

import { SHOPEE_BRIDGE_URL, SHOPEE_BRIDGE_KEY } from './init';

export interface ShopeeMutationItem {
  transaction_id: string;
  external_id: string;
  amount: number;
  merchant_name: string;
  store_name: string;
  merchant_id: number;
  store_id: number;
  status_code: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  created_at: string;
  raw_timestamp: number;
}

export interface ShopeeMutationResponse {
  success: boolean;
  message: string;
  data: ShopeeMutationItem[];
  total?: number;
  totalNetSales?: number;
  code?: number; // Shopee specific error code (-1 = expired)
}

export interface GetShopeeMutationsParams {
  token?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Menarik data mutasi transaksi ShopeePay via Bridge API.
 */
export async function getShopeeMutations(params: GetShopeeMutationsParams): Promise<ShopeeMutationResponse> {
  const query = new URLSearchParams();
  query.append('key', SHOPEE_BRIDGE_KEY);
  
  if (params.token) query.append('token', params.token);
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());

  const url = `${SHOPEE_BRIDGE_URL}/api/mutasi?${query.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'stspointkey': SHOPEE_BRIDGE_KEY
      },
      // Timeout 20 detik karena API Shopee terkadang lambat merespon
      signal: AbortSignal.timeout(20000),
      cache: 'no-store'
    });

    const result = await response.json();

    // Penanganan khusus jika token expired (code -1 dari bridge)
    if (result.code === -1) {
      return {
        success: false,
        message: 'Sesi ShopeePay telah berakhir. Harap hubungkan kembali akun Anda.',
        data: [],
        code: -1
      };
    }

    return {
      success: result.success,
      message: result.message,
      data: result.data || [],
      total: result.total,
      totalNetSales: result.totalNetSales
    };
  } catch (error: any) {
    console.error('ShopeePay Mutation API Error:', error);
    return { 
      success: false, 
      message: 'Koneksi ke server bridge terputus atau timeout.', 
      data: [] 
    };
  }
}
