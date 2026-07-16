'use server';
/**
 * @fileOverview Orderkuota PPOB Service Engine.
 * Menangani pengambilan data produk dan eksekusi transaksi PPOB melalui bridge API.
 */

import { STS_POINT_API_KEY } from '@/lib/orderkuota/init';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Setup database SQLite di luar folder src
const DB_PATH = path.join(process.cwd(), 'database', 'ppob.db');
const dbDir = path.dirname(DB_PATH);

// Pastikan direktori database ada
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Inisialisasi skema tabel produk PPOB dengan dukungan multi-provider dan tipe (Prepaid/Pasca)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    kode TEXT,
    provider TEXT,
    tipe TEXT,
    keterangan TEXT,
    produk TEXT,
    kategori TEXT,
    harga INTEGER,
    status TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (kode, provider)
  )
`);

/**
 * MIGRASI OTOMATIS: Tambahkan kolom 'tipe' jika belum ada (untuk database lama)
 */
try {
  const tableInfo = db.prepare("PRAGMA table_info(products)").all() as any[];
  const hasTipeColumn = tableInfo.some(col => col.name === 'tipe');
  if (!hasTipeColumn) {
    db.exec("ALTER TABLE products ADD COLUMN tipe TEXT DEFAULT 'Prepaid'");
    console.log("Migration: Column 'tipe' added to products table.");
  }
} catch (e) {
  console.error("Migration error:", e);
}

export interface OrkutPPOBProduct {
  buyer_sku_code: string;
  product_name: string;
  category: string;
  brand: string;
  type: string;
  price: number;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  desc: string;
  provider: string;
}

export interface OkeConnectProduct {
  kode: string;
  keterangan: string;
  produk: string;
  kategori: string;
  harga: string;
  status: string;
}

/**
 * Mengambil produk dari OkeConnect dan menyimpan ke SQLite database/ppob.db
 */
export async function getProduct() {
  const url = "https://okeconnect.com/harga/json?id=905ccd028329b0a&produk=pulsa,kuota_nasional,kuota_telkomsel,kuota_byu,kuota_indosat,kuota_tri,kuota_xl,kuota_axis,kuota_smartfren";
  
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error("Gagal mengambil data dari OkeConnect");
    
    const data: OkeConnectProduct[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Data yang diterima bukan format array JSON yang valid.");
    }

    const upsert = db.prepare(`
      INSERT INTO products (kode, provider, tipe, keterangan, produk, kategori, harga, status, updated_at)
      VALUES (?, 'Orderkuota', 'Prepaid', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(kode, provider) DO UPDATE SET
        tipe=excluded.tipe,
        keterangan=excluded.keterangan,
        produk=excluded.produk,
        kategori=excluded.kategori,
        harga=excluded.harga,
        status=excluded.status,
        updated_at=CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction((products: OkeConnectProduct[]) => {
      for (const p of products) {
        upsert.run(p.kode, p.keterangan, p.produk, p.kategori, parseInt(p.harga || "0"), p.status);
      }
    });

    transaction(data);
    
    return { 
      success: true, 
      message: `Berhasil sinkronisasi ${data.length} produk OkeConnect ke database lokal.`,
      count: data.length 
    };
  } catch (error: any) {
    console.error("getProduct Sync Error:", error);
    return { success: false, message: error.message || "Terjadi kesalahan saat sinkronisasi database." };
  }
}

/**
 * Mengambil daftar harga PPOB dari database SQLite lokal.
 */
export async function getOrderkuotaPPOBPricelist() {
  try {
    const products = db.prepare("SELECT * FROM products ORDER BY provider ASC, kategori ASC, harga ASC").all() as any[];
    
    // Mapping format internal ke format yang diharapkan UI
    const mappedData: OrkutPPOBProduct[] = products.map(p => ({
      buyer_sku_code: p.kode,
      product_name: p.keterangan,
      category: p.produk,
      brand: p.kategori,
      type: p.tipe || 'Prepaid',
      price: p.harga,
      buyer_product_status: p.status === "1" || p.status === "active",
      seller_product_status: true,
      desc: p.keterangan,
      provider: p.provider || 'Orderkuota'
    }));

    return { 
      success: true, 
      data: mappedData, 
      message: mappedData.length > 0 ? "Data dimuat dari database lokal." : "Database kosong, harap lakukan sinkronisasi." 
    };
  } catch (error: any) {
    console.error("Orderkuota Pricelist SQLite Error:", error);
    return { 
      success: false, 
      data: [], 
      message: "Gagal mengambil data dari database lokal." 
    };
  }
}

/**
 * Eksekusi transaksi PPOB (Pulsa, Data, Token, dll).
 */
export async function createOrderkuotaPPOBTransaction(params: {
  username: string;
  token: string;
  sku: string;
  target: string;
  ref_id: string;
}) {
  const { username, token, sku, target, ref_id } = params;
  const url = `https://api.qrispay.biz.id/orderkuota/transaksi?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}&sku=${encodeURIComponent(sku)}&target=${encodeURIComponent(target)}&ref_id=${encodeURIComponent(ref_id)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    const data = await response.json();
    return { 
      success: data.status, 
      message: data.message, 
      data: data.result 
    };
  } catch (error: any) {
    console.error("Orderkuota Transaction Error:", error);
    return { 
      success: false, 
      message: "Terjadi kesalahan saat memproses transaksi ke provider." 
    };
  }
}

/**
 * Cek status transaksi PPOB secara spesifik.
 */
export async function checkOrderkuotaPPOBStatus(params: {
  username: string;
  token: string;
  ref_id: string;
}) {
  const { username, token, ref_id } = params;
  const url = `https://api.qrispay.biz.id/orderkuota/status?apikey=${STS_POINT_API_KEY}&username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}&ref_id=${encodeURIComponent(ref_id)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await response.json();
    return { 
      success: data.status, 
      message: data.message, 
      data: data.result 
    };
  } catch (error: any) {
    console.error("Orderkuota Status Error:", error);
    return { 
      success: false, 
      message: "Gagal mendapatkan status transaksi terbaru." 
    };
  }
}
