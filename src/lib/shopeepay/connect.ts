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
 * Mengambil status konfigurasi aktif dari server bridge.
 */
export async function getShopeeStatus(): Promise<ShopeeConfigResponse> {
  const baseUrl = SHOPEE_BRIDGE_URL.endsWith('/') ? SHOPEE_BRIDGE_URL.slice(0, -1) : SHOPEE_BRIDGE_URL;
  const url = `${baseUrl}/api/get-config`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'stspointkey': SHOPEE_BRIDGE_KEY,
        'User-Agent': 'STSPoint-Infrastructure/1.2'
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

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
