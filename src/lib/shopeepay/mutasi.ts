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
  code?: number; 
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
  try {
    const query = new URLSearchParams();
    
    // API Key platform (Wajib)
    query.append('key', SHOPEE_BRIDGE_KEY);
    
    if (params.token) query.append('token', params.token);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    // Gunakan URL constructor untuk keamanan rute
    const baseUrl = SHOPEE_BRIDGE_URL.endsWith('/') ? SHOPEE_BRIDGE_URL.slice(0, -1) : SHOPEE_BRIDGE_URL;
    const url = `${baseUrl}/api/mutasi?${query.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'stspointkey': SHOPEE_BRIDGE_KEY,
        'User-Agent': 'STSPoint-Infrastructure/1.2 (ShopeePay-Bridge)'
      },
      signal: AbortSignal.timeout(30000), // Timeout 30 detik
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

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
      success: !!result.success,
      message: result.message || (result.success ? "Berhasil" : "Gagal mengambil mutasi"),
      data: Array.isArray(result.data) ? result.data : [],
      total: result.total || 0,
      totalNetSales: result.totalNetSales || 0
    };
  } catch (error: any) {
    console.error('ShopeePay Mutation API Error:', error);
    return { 
      success: false, 
      message: `Koneksi ke server bridge terputus atau timeout. (${error.message || 'Unknown Network Error'})`, 
      data: [] 
    };
  }
}
