'use server';
/**
 * @fileOverview Library Transfer Saldo OVO & Rekening Bank.
 */

import { OVO_BRIDGE_URL, OVO_BRIDGE_KEY } from './init';

function getHeaders(token: string, deviceId: string) {
  return {
    'Content-Type': 'application/json',
    'x-ovo-token': token,
    'x-device-id': deviceId,
    'stspointkey': OVO_BRIDGE_KEY,
    'User-Agent': 'STSPoint-Infrastructure/1.2'
  };
}

/**
 * Cek Nomor HP Tujuan OVO
 */
export async function checkOvoNumber(params: { token: string; deviceId: string; phone: string; amount: number }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/transfer/check-ovo`, {
      method: 'POST',
      headers: getHeaders(params.token, params.deviceId),
      body: JSON.stringify({
        phone: params.phone,
        amount: params.amount
      }),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Transfer Sesama OVO
 */
export async function transferToOvo(params: { token: string; deviceId: string; phone: string; amount: number; message?: string }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/transfer/ovo`, {
      method: 'POST',
      headers: getHeaders(params.token, params.deviceId),
      body: JSON.stringify({
        phone: params.phone,
        amount: params.amount,
        message: params.message
      }),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Daftar Kode Bank Master
 */
export async function getOvoBankList(params: { token: string; deviceId: string }) {
  try {
    const response = await fetch(`${OVO_BRIDGE_URL}/transfer/banks`, {
      method: 'GET',
      headers: getHeaders(params.token, params.deviceId),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Inquiry Rekening Bank
 */
export async function bankInquiry(params: { 
  token: string;
  deviceId: string;
  accountNo: string; 
  bankCode: string; 
  bankName: string; 
  amount: number; 
  message?: string 
}) {
  try {
    const { token, deviceId, ...body } = params;
    const response = await fetch(`${OVO_BRIDGE_URL}/transfer/bank-inquiry`, {
      method: 'POST',
      headers: getHeaders(token, deviceId),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Transfer Direct ke Bank
 */
export async function transferToBank(params: {
  token: string;
  deviceId: string;
  accountName: string;
  accountNo: string;
  accountNoDestination: string;
  amount: number;
  bankCode: string;
  bankName: string;
  message?: string;
  notes?: string;
}) {
  try {
    const { token, deviceId, ...body } = params;
    const response = await fetch(`${OVO_BRIDGE_URL}/transfer/bank`, {
      method: 'POST',
      headers: getHeaders(token, deviceId),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
      cache: 'no-store'
    });

    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
