'use server';
/**
 * @fileOverview Library untuk menarik data mutasi transaksi dari ShopeePay Merchant Portal.
 * Diperbarui untuk menggunakan rute /shopee/mutasi (POST) sesuai dokumentasi terbaru.
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
    // Menggunakan rute /shopee/mutasi yang direkomendasikan
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
        'stspointkey': SHOPEE_BRIDGE_KEY,
        'User-Agent': 'STSPoint-Infrastructure/1.2'
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textError = await response.text();
      console.error("Non-JSON Response from Shopee Bridge:", textError.substring(0, 200));
      return {
        success: false,
        message: `Server Bridge mengembalikan format tidak valid (HTML/Text). Pastikan URL dan API Key benar.`,
        data: []
      };
    }

    const result = await response.json();

    // Penanganan status 401 atau code -1 (Expired)
    if (response.status === 401 || result.code === -1 || result.success === false && result.message?.toLowerCase().includes("expired")) {
      return {
        success: false,
        message: result.message || 'Sesi ShopeePay telah berakhir atau token tidak valid.',
        data: [],
        code: -1,
        statusHttp: response.status
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: result.message || `Bridge Error: HTTP ${response.status}`,
        data: []
      };
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
      message: `Gagal terhubung ke Bridge: ${error.message || 'Unknown Network Error'}`, 
      data: [] 
    };
  }
}
