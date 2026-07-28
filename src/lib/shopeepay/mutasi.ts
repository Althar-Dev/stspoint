'use server';
/**
 * @fileOverview Library untuk menarik data mutasi transaksi dari ShopeePay Merchant Portal.
 * Diperbarui menggunakan metode POST dan payload JSON sesuai dokumentasi terbaru.
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
  statusHttp?: number;
}

export interface GetShopeeMutationsParams {
  token?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * Menarik data mutasi transaksi ShopeePay via Bridge API (Method POST).
 */
export async function getShopeeMutations(params: GetShopeeMutationsParams): Promise<ShopeeMutationResponse> {
  try {
    const url = `${SHOPEE_BRIDGE_URL}/shopee/mutasi`;

    const payload = {
      secret_key: SHOPEE_BRIDGE_KEY,
      token: params.token || "",
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit || 50
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'STSPoint-Infrastructure/1.2 (ShopeePay-Bridge)'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store'
    });

    const result = await response.json();

    // Penanganan khusus jika token expired atau unauthorized (HTTP 401 atau success: false dengan code -1)
    if (response.status === 401 || result.code === -1) {
      return {
        success: false,
        message: result.message || 'Sesi ShopeePay telah berakhir atau token tidak valid.',
        data: [],
        code: -1,
        statusHttp: response.status
      };
    }

    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: !!result.success,
      message: result.message || (result.success ? "Berhasil" : "Gagal mengambil mutasi"),
      data: Array.isArray(result.data) ? result.data : [],
      total: result.total || 0,
      totalNetSales: result.totalNetSales || 0,
      statusHttp: result.statusHttp || response.status
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
