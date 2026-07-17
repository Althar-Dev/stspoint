
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

/**
 * [D01] toCRC16 - Hitung checksum CRC16 untuk string QRIS
 */
function toCRC16(str: string): string {
  let crc = 0xFFFF;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  return hex.length === 3 ? '0' + hex : hex;
}

/**
 * [D02] createDynamicQrisString - Menghasilkan payload string QRIS dengan nominal dinamis
 * @param qrisBase String QRIS Statis dasar
 * @param nominal Nominal dalam format string (misal: "10000")
 */
export function createDynamicQrisString(qrisBase: string, nominal: string): string {
  if (!qrisBase || typeof qrisBase !== 'string') {
    throw new Error('qrisBase string tidak valid');
  }

  // 1. Buang 4 karakter terakhir (CRC lama)
  const qrisNoCrc = qrisBase.slice(0, -4);
  
  // 2. Ubah indikator Static (010211) menjadi Dynamic (010212)
  const dynamicIndicated = qrisNoCrc.replace('010211', '010212');
  
  // 3. Pecah berdasarkan ID 58 (Country Code ID) untuk menyisipkan nominal (ID 54)
  const parts = dynamicIndicated.split('5802ID');
  if (parts.length < 2) {
    throw new Error('Format QRIS dasar tidak kompatibel (5802ID tidak ditemukan)');
  }

  // 4. Susun tag nominal (Tag 54)
  // Format: 54 + [Length 2 digit] + [Nominal]
  const amountTag = '54' + ('0' + nominal.length).slice(-2) + nominal;
  
  // 5. Gabungkan kembali dan hitung CRC16 baru
  const newPayload = parts[0] + amountTag + '5802ID' + parts[1];
  const finalCrc = toCRC16(newPayload);
  
  return newPayload + finalCrc;
}

/**
 * [D03] qrisDinamis - Menghasilkan file gambar QR Code dari QRIS dinamis
 * @param qrisBase String QRIS dasar
 * @param nominal Nominal transaksi
 * @param outputPath Path lengkap tempat menyimpan file (misal: './public/qrs/order123.png')
 */
export async function generateQrisImage(qrisBase: string, nominal: string, outputPath: string): Promise<string> {
  const finalPayload = createDynamicQrisString(qrisBase, nominal);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await new Promise<void>((resolve, reject) => {
    QRCode.toFile(outputPath, finalPayload, { 
      margin: 2, 
      scale: 10, 
      type: 'png',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, (err) => {
      if (err) return reject(new Error('Gagal generate QR File: ' + err.message));
      resolve();
    });
  });

  return outputPath;
}

/**
 * [D04] generateQrisDataUri - Menghasilkan base64 image (Data URI) untuk langsung ditampilkan di UI
 */
export async function generateQrisDataUri(qrisBase: string, nominal: string): Promise<string> {
  const finalPayload = createDynamicQrisString(qrisBase, nominal);
  
  return await new Promise<string>((resolve, reject) => {
    QRCode.toDataURL(finalPayload, { margin: 2, scale: 10 }, (err, url) => {
      if (err) return reject(new Error('Gagal generate QR DataURL: ' + err.message));
      resolve(url);
    });
  });
}
