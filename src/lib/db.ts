
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * @fileOverview Shared SQLite Database Connection (Singleton)
 * Menangani inisialisasi database ppob.db dengan mode WAL untuk mencegah error 'readonly'.
 */

let db: any;

export function getDb() {
  if (!db) {
    const DB_PATH = path.join(process.cwd(), 'database', 'ppob.db');
    const dbDir = path.dirname(DB_PATH);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    
    // Aktifkan Write-Ahead Logging untuk stabilitas transaksi
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    // Inisialisasi Tabel Produk
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

    // Inisialisasi Tabel Markup dengan kolom rentang harga
    db.exec(`
      CREATE TABLE IF NOT EXISTS markup_rules (
        id TEXT PRIMARY KEY,
        targetProvider TEXT,
        targetType TEXT,
        targetValue TEXT,
        markupType TEXT,
        value REAL,
        minPrice INTEGER DEFAULT 0,
        maxPrice INTEGER DEFAULT 999999999,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    /**
     * MIGRASI: Tambahkan kolom yang mungkin hilang jika database sudah ada sebelumnya
     */
    try {
      const tableInfo = db.prepare("PRAGMA table_info(markup_rules)").all() as any[];
      
      const columnsToAdd = [
        { name: 'targetProvider', type: 'TEXT DEFAULT "all"' },
        { name: 'minPrice', type: 'INTEGER DEFAULT 0' },
        { name: 'maxPrice', type: 'INTEGER DEFAULT 999999999' }
      ];

      for (const col of columnsToAdd) {
        if (!tableInfo.some(c => c.name === col.name)) {
          db.exec(`ALTER TABLE markup_rules ADD COLUMN ${col.name} ${col.type}`);
          console.log(`Migration: Added column ${col.name} to markup_rules.`);
        }
      }
    } catch (e) {
      console.error("Migration error:", e);
    }
    
    console.log("SQLite Database initialized with WAL mode.");
  }
  return db;
}
