'use server';
/**
 * @fileOverview Library untuk mengelola status koneksi ShopeePay di server bridge.
 */

import { SHOPEE_BRIDGE_URL, SHOPEE_BRIDGE_KEY } from './init';

export interface ShopeeConfigResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Mengambil status koneksi dengan melakukan hit ke endpoint mutasi dengan token kosong.
 */
export async function getShopeeStatus(): Promise<ShopeeConfigResponse> {
  const url = `${SHOPEE_BRIDGE_URL}/shopee/mutasi`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stspointkey': SHOPEE_BRIDGE_KEY,
        'User-Agent': 'STSPoint-Infrastructure/1.2'
      },
      body: JSON.stringify({
        secret_key: SHOPEE_BRIDGE_KEY,
        token: ""
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return { success: false, message: "Bridge mengembalikan respon non-JSON (HTML/Text)." };
    }

    const result = await response.json();
    return {
      success: result.success,
      message: result.message,
      data: result.data
    };
  } catch (error: any) {
    console.error('ShopeePay Get Status Error:', error);
    return { 
      success: false, 
      message: `Gagal mengecek status server bridge. (${error.message || 'Connection Error'})` 
    };
  }
}
