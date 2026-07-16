
'use server';
/**
 * @fileOverview DigiFlazz PPOB Service Engine.
 * Menangani sinkronisasi produk DigiFlazz ke database SQLite lokal menggunakan koneksi bersama.
 */

import { getDb } from '@/lib/db';
import crypto from 'crypto';

export interface DigiFlazzProduct {
  product_name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

const DIGI_USERNAME = process.env.DIGIFLAZZ_USERNAME || 'username';
const DIGI_API_KEY = process.env.DIGIFLAZZ_API_KEY || 'dev-apiKey';

export async function getProduct() {
  const db = getDb();
  const url = "https://api.digiflazz.com/v1/price-list";
  const cmd = 'prepaid'; 
  
  const sign = crypto
    .createHash('md5')
    .update(DIGI_USERNAME + DIGI_API_KEY + "pricelist")
    .digest('hex');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: cmd,
        username: DIGI_USERNAME,
        sign: sign
      }),
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Gagal menghubungi API DigiFlazz");
    
    const result = await response.json();
    const data: DigiFlazzProduct[] = result.data;
    
    if (!Array.isArray(data)) {
      throw new Error("Respon DigiFlazz tidak valid atau data kosong.");
    }

    const typeLabel = cmd === 'prepaid' ? 'Prepaid' : 'Pasca';

    const upsert = db.prepare(`
      INSERT INTO products (kode, provider, tipe, keterangan, produk, kategori, harga, status, updated_at)
      VALUES (?, 'DigiFlazz', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(kode, provider) DO UPDATE SET
        tipe=excluded.tipe,
        keterangan=excluded.keterangan,
        produk=excluded.produk,
        kategori=excluded.kategori,
        harga=excluded.harga,
        status=excluded.status,
        updated_at=CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction((products: DigiFlazzProduct[]) => {
      for (const p of products) {
        upsert.run(
          p.buyer_sku_code, 
          typeLabel,
          p.product_name, 
          p.category, 
          p.brand, 
          p.price, 
          p.seller_product_status && p.buyer_product_status ? 'active' : 'maintenance'
        );
      }
    });

    transaction(data);
    
    return { 
      success: true, 
      message: `Berhasil sinkronisasi ${data.length} produk DigiFlazz ke database lokal.`,
      count: data.length 
    };
  } catch (error: any) {
    console.error("DigiFlazz Sync Error:", error);
    return { success: false, message: error.message || "Terjadi kesalahan sinkronisasi DigiFlazz." };
  }
}
