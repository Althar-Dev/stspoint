
'use server';
/**
 * @fileOverview MongoDB Product & Transaction Service for Web App Prem.
 * Handles secure connection using a direct URI input for Atlas compatibility.
 */

import { MongoClient, ObjectId } from 'mongodb';
import { initializeFirebase } from '@/firebase/core';
import { doc, getDoc } from 'firebase/firestore';

async function getMongoClient(
  userId: string, 
  appId: string, 
  colKey: 'mongoCol' | 'mongoUserCol' | 'mongoTrxCol' | 'mongoSettingsCol' = 'mongoCol'
) {
  const { firestore } = initializeFirebase();
  const appRef = doc(firestore, 'users', userId, 'apps', appId);
  const appSnap = await getDoc(appRef);

  if (!appSnap.exists()) {
    throw new Error("Aplikasi tidak ditemukan di registry.");
  }

  const appData = appSnap.data();
  const { mongoUri, mongoDb } = appData;
  const colName = appData[colKey];

  if (!mongoUri) {
    throw new Error("Kredensial MongoDB (URI) belum dikonfigurasi untuk aplikasi ini.");
  }

  if (!colName) {
    throw new Error(`Koleksi '${colKey}' belum dikonfigurasi untuk aplikasi ini.`);
  }

  const client = new MongoClient(mongoUri, {
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });

  return { client, dbName: mongoDb || 'test', colName };
}

/**
 * Mengambil daftar produk dari MongoDB
 */
export async function getMongoProducts(userId: string, appId: string) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId, 'mongoCol');
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);
    
    const mongoProducts = await collection.find({}).toArray();
    await client.close();

    const serializedData = mongoProducts.map(p => ({
      ...p,
      _id: p._id.toString(),
      provider: "MongoDB"
    }));

    return { 
      success: true, 
      data: serializedData,
      message: `Berhasil mengambil ${serializedData.length} produk dari MongoDB.`
    };
  } catch (error: any) {
    console.error("MongoDB Fetch Products Error:", error);
    return { success: false, message: `Gagal terhubung ke MongoDB: ${error.message}` };
  }
}

/**
 * Mengambil satu produk berdasarkan ID dari MongoDB
 */
export async function getMongoProductById(userId: string, appId: string, productId: string) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId, 'mongoCol');
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);
    
    let product = await collection.findOne({ id: productId });
    
    if (!product && ObjectId.isValid(productId)) {
      product = await collection.findOne({ _id: new ObjectId(productId) });
    }

    await client.close();

    if (!product) throw new Error("Produk tidak ditemukan.");

    return { 
      success: true, 
      data: { ...product, _id: product._id.toString(), provider: "MongoDB" }
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * Memperbarui data produk di MongoDB
 */
export async function updateMongoProduct(userId: string, appId: string, productId: string, data: any) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId, 'mongoCol');
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);

    const { _id, ...updateData } = data;
    updateData.updatedAt = new Date().toISOString();

    let result;
    result = await collection.updateOne({ id: productId }, { $set: updateData });

    if (result.matchedCount === 0 && ObjectId.isValid(productId)) {
      result = await collection.updateOne({ _id: new ObjectId(productId) }, { $set: updateData });
    }

    await client.close();

    if (result.matchedCount === 0) throw new Error("Gagal memperbarui: Produk tidak ditemukan.");

    return { success: true, message: "Produk berhasil diperbarui di MongoDB." };
  } catch (error: any) {
    console.error("MongoDB Update Product Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Mengambil riwayat transaksi dari MongoDB
 */
export async function getMongoTransactions(userId: string, appId: string) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId, 'mongoTrxCol');
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);
    
    // Ambil transaksi, urutkan dari yang terbaru
    const transactions = await collection.find({}).sort({ createdAt: -1 }).limit(500).toArray();
    await client.close();

    const serializedData = transactions.map(t => ({
      ...t,
      _id: t._id.toString(),
      id: t.external_id || t.id || t._id.toString(),
      // Mapping ke structure baru
      itemName: t.productName ? `${t.productName} - ${t.packageName || 'Regular'}` : (t.description || t.itemName || "Digital Purchase"),
      priceAmount: t.amount || t.priceAmount || 0,
      customer: t.payer_email || t.userId || "-",
      status: t.status || "PENDING",
      createdAt: t.createdAt // ISO String
    }));

    return { 
      success: true, 
      data: serializedData,
      message: `Berhasil memuat ${serializedData.length} transaksi dari MongoDB.`
    };
  } catch (error: any) {
    console.error("MongoDB Fetch Transactions Error:", error);
    return { success: false, message: `Gagal memuat transaksi: ${error.message}` };
  }
}
