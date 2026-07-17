'use server';
/**
 * @fileOverview Orderkuota PPOB Service Engine.
 * Menangani pengambilan data produk dan eksekusi transaksi PPOB melalui bridge API.
 */

import { STS_POINT_API_KEY } from '@/lib/orderkuota/init';
import { getDb } from '@/lib/db';

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

export interface MarkupRule {
  id: string;
  targetProvider: 'all' | 'DigiFlazz' | 'Orderkuota';
  targetType: 'global' | 'brand' | 'type' | 'sku';
  targetValue: string;
  markupType: 'nominal' | 'percent';
  value: number;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Menambahkan produk secara manual ke database
 */
export async function addProduct(params: {
  sku: string;
  name: string;
  provider: string;
  type: string;
  category: string;
  brand: string;
  price: number;
}) {
  const db = getDb();
  try {
    const stmt = db.prepare(`
      INSERT INTO products (kode, provider, tipe, keterangan, produk, kategori, harga, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)
      ON CONFLICT(kode, provider) DO UPDATE SET
        tipe=excluded.tipe,
        keterangan=excluded.keterangan,
        produk=excluded.produk,
        kategori=excluded.kategori,
        harga=excluded.harga,
        status='active',
        updated_at=CURRENT_TIMESTAMP
    `);

    // Standardisasi: SKU dan Brand ke Uppercase
    stmt.run(
      params.sku.toUpperCase().trim(), 
      params.provider, 
      params.type, 
      params.name.trim(), 
      params.category.trim(), 
      params.brand.toUpperCase().trim(), 
      params.price
    );
    
    return { success: true, message: "Produk berhasil ditambahkan ke database." };
  } catch (error: any) {
    console.error("Add Product Error:", error);
    return { success: false, message: error.message || "Gagal menambahkan produk." };
  }
}

/**
 * Mengambil produk dari OkeConnect (Orderkuota) dan menyimpan ke SQLite database/ppob.db
 */
export async function getProduct(url: string, tipe: 'Prepaid' | 'Pasca' = 'Prepaid') {
  const db = getDb();
  if (!url) {
    return { success: false, message: "URL sinkronisasi tidak boleh kosong." };
  }

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Gagal mengambil data: ${response.statusText}`);
    
    const data: OkeConnectProduct[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error("Data yang diterima bukan format array JSON yang valid.");
    }

    const upsert = db.prepare(`
      INSERT INTO products (kode, provider, tipe, keterangan, produk, kategori, harga, status, updated_at)
      VALUES (?, 'Orderkuota', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        upsert.run(p.kode, tipe, p.keterangan, p.produk, p.kategori, parseInt(p.harga || "0"), p.status);
      }
    });

    transaction(data);
    
    return { 
      success: true, 
      message: `Berhasil sinkronisasi ${data.length} produk ${tipe} Orderkuota ke database lokal.`,
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
  const db = getDb();
  try {
    const products = db.prepare("SELECT * FROM products ORDER BY provider ASC, kategori ASC, harga ASC").all() as any[];
    
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
 * Menghapus data produk dengan filter tertentu
 */
export async function deleteProducts(filters: {
  provider?: string;
  tipe?: string;
  brand?: string;
}) {
  const db = getDb();
  try {
    let query = "DELETE FROM products WHERE 1=1";
    const params: any[] = [];

    if (filters.provider && filters.provider !== 'all') {
      query += " AND provider = ?";
      params.push(filters.provider);
    }

    if (filters.tipe && filters.tipe !== 'all') {
      query += " AND tipe = ?";
      params.push(filters.tipe);
    }

    if (filters.brand && filters.brand !== 'all') {
      query += " AND kategori = ?";
      params.push(filters.brand);
    }

    if (!filters.provider && !filters.tipe && !filters.brand) {
      query = "DELETE FROM products";
    }

    const stmt = db.prepare(query);
    const info = stmt.run(...params);

    return { 
      success: true, 
      message: `Berhasil menghapus ${info.changes} produk dari database.`,
      count: info.changes 
    };
  } catch (error: any) {
    console.error("Delete Products Error:", error);
    return { success: false, message: error.message || "Gagal menghapus data dari database." };
  }
}

/**
 * Eksekusi transaksi PPOB (Pulsa, Data, Token, dll) melalui API Bridge.
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

/**
 * Meneruskan pesanan langsung ke H2H OkeConnect (H2H Engine).
 * Mendukung format Prepaid (Global) dan Pasca (Open Denom).
 */
export async function forwardOrderToOkeConnect(params: {
  type: 'Prepaid' | 'Pasca';
  product: string;
  dest: string;
  refID: string;
  memberID: string;
  pin: string;
  password: string;
  qty?: number;
}) {
  const { type, product, dest, refID, memberID, pin, password, qty } = params;
  
  // Format dasar URL sesuai spesifikasi OkeConnect H2H
  let url = `https://h2h.okeconnect.com/trx?product=${encodeURIComponent(product)}&dest=${encodeURIComponent(dest)}&refID=${encodeURIComponent(refID)}&memberID=${encodeURIComponent(memberID)}&pin=${encodeURIComponent(pin)}&password=${encodeURIComponent(password)}`;
  
  // Jika tipe Pasca (Open Denom), tambahkan parameter qty (Nominal Pengisian)
  if (type === 'Pasca' && qty !== undefined) {
    url = `https://h2h.okeconnect.com/trx?product=${encodeURIComponent(product)}&dest=${encodeURIComponent(dest)}&qty=${qty}&refID=${encodeURIComponent(refID)}&memberID=${encodeURIComponent(memberID)}&pin=${encodeURIComponent(pin)}&password=${encodeURIComponent(password)}`;
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    const text = await response.text(); 
    
    // OkeConnect mengembalikan respon teks. Cek keberadaan kata kunci sukses/proses.
    const isSuccess = text.toUpperCase().includes("SUKSES") || text.toUpperCase().includes("PROSES");
    
    return { 
      success: isSuccess, 
      message: text,
      raw: text 
    };
  } catch (error: any) {
    console.error("forwardOrderToOkeConnect Error:", error);
    return { success: false, message: "Koneksi ke H2H OkeConnect terputus atau timeout." };
  }
}

/**
 * Cek status transaksi langsung ke H2H OkeConnect (H2H Status Engine).
 */
export async function checkStatusOkeConnect(params: {
  product: string;
  dest: string;
  refID: string;
  memberID: string;
  pin: string;
  password: string;
  qty?: number;
}) {
  const { product, dest, refID, memberID, pin, password, qty } = params;
  
  let url = `https://h2h.okeconnect.com/trx?pin=${encodeURIComponent(pin)}&product=${encodeURIComponent(product)}&dest=${encodeURIComponent(dest)}&refID=${encodeURIComponent(refID)}&memberID=${encodeURIComponent(memberID)}&password=${encodeURIComponent(password)}&check=1`;
  
  if (qty !== undefined) {
    url += `&qty=${qty}`;
  }

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const text = await response.text();
    
    const textUpper = text.toUpperCase();
    let status: 'Pending' | 'Success' | 'Failed' = 'Pending';
    
    if (textUpper.includes("SUKSES")) {
      status = 'Success';
    } else if (textUpper.includes("GAGAL")) {
      status = 'Failed';
    }

    return { 
      success: true, 
      status: status,
      message: text,
      raw: text 
    };
  } catch (error: any) {
    console.error("checkStatusOkeConnect Error:", error);
    return { success: false, message: "Gagal cek status H2H: Koneksi terputus." };
  }
}

// --- MARKUP RULES CRUD ---

export async function getMarkupRules(): Promise<{ success: boolean; data: MarkupRule[] }> {
  const db = getDb();
  try {
    const rules = db.prepare("SELECT * FROM markup_rules ORDER BY minPrice ASC, updated_at DESC").all() as any[];
    return { success: true, data: rules };
  } catch (e) {
    console.error("Get Markup Rules Error:", e);
    return { success: false, data: [] };
  }
}

export async function addMarkupRule(rule: MarkupRule) {
  const db = getDb();
  try {
    const stmt = db.prepare(`
      INSERT INTO markup_rules (id, targetProvider, targetType, targetValue, markupType, value, minPrice, maxPrice, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    stmt.run(
      rule.id, 
      rule.targetProvider, 
      rule.targetType, 
      rule.targetValue, 
      rule.markupType, 
      rule.value,
      rule.minPrice || 0,
      rule.maxPrice || 999999999
    );
    return { success: true, message: "Aturan markup berhasil disimpan." };
  } catch (e) {
    console.error("Add Markup Rule Error:", e);
    return { success: false, message: "Gagal menyimpan aturan markup." };
  }
}

export async function deleteMarkupRule(id: string) {
  const db = getDb();
  try {
    const stmt = db.prepare("DELETE FROM markup_rules WHERE id = ?");
    stmt.run(id);
    return { success: true, message: "Aturan markup berhasil dihapus." };
  } catch (e) {
    console.error("Delete Markup Rule Error:", e);
    return { success: false, message: "Gagal menghapus aturan markup." };
  }
}
