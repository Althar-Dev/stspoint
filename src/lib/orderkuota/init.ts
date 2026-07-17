/**
 * @fileOverview Inisialisasi kunci API STSPoint untuk Orderkuota.
 * Kunci ini bersifat private dan digunakan sebagai jembatan (bridge) ke API Orderkuota.
 */

export const STS_POINT_API_KEY = 'STSPointKey';

/**
 * Kredensial H2H Global (Milik Platform)
 * Digunakan untuk meneruskan pesanan dari merchant ke mesin H2H OkeConnect.
 */
export const OKE_MEMBER_ID = process.env.OKE_MEMBER_ID || 'OK00000';
export const OKE_PIN = process.env.OKE_PIN || '123456';
export const OKE_PASSWORD = process.env.OKE_PASSWORD || 'password';
