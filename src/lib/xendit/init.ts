/**
 * @fileOverview Inisialisasi Kredensial Xendit untuk STSPay Infrastructure.
 * File ini menyimpan konfigurasi dasar dan fungsi pembantu autentikasi.
 */

// Kunci rahasia diambil dari environment variable untuk keamanan maksimal.
// Format: xnd_development_... atau xnd_production_...
export const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || '';

/**
 * Helper untuk membuat header autentikasi Basic Auth Xendit.
 * Xendit menggunakan Secret Key sebagai username dan password dikosongkan.
 */
export function getXenditHeaders() {
  if (!XENDIT_SECRET_KEY) {
    console.error('CRITICAL: XENDIT_SECRET_KEY is not defined in environment variables.');
  }

  const base64Key = Buffer.from(`${XENDIT_SECRET_KEY}:`).toString('base64');
  return {
    'Authorization': `Basic ${base64Key}`,
    'Content-Type': 'application/json',
  };
}
