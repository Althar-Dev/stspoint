/**
 * @fileOverview Inisialisasi Kredensial Midtrans untuk STSPay Infrastructure.
 */

// Kunci rahasia (Server Key) harus disimpan di environment variable.
export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
export const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Base URL otomatis beralih antara Sandbox dan Production
export const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://api.midtrans.com/v2' 
  : 'https://api.sandbox.midtrans.com/v2';

/**
 * Helper untuk membuat header autentikasi Basic Auth Midtrans.
 * Midtrans menggunakan Server Key sebagai username dan password dikosongkan.
 */
export function getMidtransHeaders() {
  if (!MIDTRANS_SERVER_KEY) {
    console.error('CRITICAL: MIDTRANS_SERVER_KEY is not defined in environment variables.');
  }

  // Penting: Midtrans mewajibkan ":" setelah Server Key sebelum di-encode ke Base64
  const authString = `${MIDTRANS_SERVER_KEY}:`;
  const base64Key = Buffer.from(authString).toString('base64');
  
  return {
    'Authorization': `Basic ${base64Key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
