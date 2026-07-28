'use server';
/**
 * @fileOverview Library untuk mengelola konfigurasi dan sesi ShopeePay di server bridge.
 */

import { SHOPEE_BRIDGE_URL, SHOPEE_BRIDGE_KEY } from './init';

export interface ShopeeConfigResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Menyimpan innerToken ShopeePay ke server bridge.
 */
export async function saveShopeeConfig(innerToken: string): Promise<ShopeeConfigResponse> {
  const url = `${SHOPEE_BRIDGE_URL}/api/save-config`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stspointkey': SHOPEE_BRIDGE_KEY
      },
      body: JSON.stringify({
        innerToken,
        STSPointKey: SHOPEE_BRIDGE_KEY
      }),
      signal: AbortSignal.timeout(15000),
    });

    const result = await response.json();
    return {
      success: result.success,
      message: result.message,
      data: result.data
    };
  } catch (error: any) {
    console.error('ShopeePay Save Config Error:', error);
    return { 
      success: false, 
      message: error.message || 'Gagal menyimpan konfigurasi ke server bridge.' 
    };
  }
}

/**
 * Mengambil status konfigurasi aktif dari server bridge.
 */
export async function getShopeeStatus(): Promise<ShopeeConfigResponse> {
  const url = `${SHOPEE_BRIDGE_URL}/api/get-config`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'stspointkey': SHOPEE_BRIDGE_KEY
      },
      signal: AbortSignal.timeout(10000),
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
      message: 'Gagal mengecek status server bridge.' 
    };
  }
}
