
'use server';
/**
 * @fileOverview MongoDB Product Service for Web App Prem.
 * Handles secure connection using a direct URI input for Atlas compatibility.
 */

import { MongoClient, ObjectId } from 'mongodb';
import { initializeFirebase } from '@/firebase/core';
import { doc, getDoc } from 'firebase/firestore';

async function getMongoClient(userId: string, appId: string) {
  const { firestore } = initializeFirebase();
  const appRef = doc(firestore, 'users', userId, 'apps', appId);
  const appSnap = await getDoc(appRef);

  if (!appSnap.exists()) {
    throw new Error("Aplikasi tidak ditemukan di registry.");
  }

  const appData = appSnap.data();
  const { mongoUri, mongoDb, mongoCol } = appData;

  if (!mongoUri) {
    throw new Error("Kredensial MongoDB (URI) belum dikonfigurasi untuk aplikasi ini.");
  }

  const client = new MongoClient(mongoUri, {
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  });

  return { client, dbName: mongoDb || 'test', colName: mongoCol || 'products' };
}

export async function getMongoProducts(userId: string, appId: string) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId);
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
    console.error("MongoDB Fetch Error:", error);
    return { success: false, message: `Gagal terhubung ke MongoDB: ${error.message}` };
  }
}

export async function getMongoProductById(userId: string, appId: string, productId: string) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId);
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);
    
    // We try to find by string ID or custom id field if provided
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

export async function updateMongoProduct(userId: string, appId: string, productId: string, data: any) {
  try {
    const { client, dbName, colName } = await getMongoClient(userId, appId);
    await client.connect();
    
    const database = client.db(dbName);
    const collection = database.collection(colName);

    // Remove _id from data to avoid update error
    const { _id, ...updateData } = data;
    
    // Always update updatedAt
    updateData.updatedAt = new Date().toISOString();

    let result;
    // Try update by custom 'id' field first
    result = await collection.updateOne({ id: productId }, { $set: updateData });

    if (result.matchedCount === 0 && ObjectId.isValid(productId)) {
      result = await collection.updateOne({ _id: new ObjectId(productId) }, { $set: updateData });
    }

    await client.close();

    if (result.matchedCount === 0) throw new Error("Gagal memperbarui: Produk tidak ditemukan.");

    return { success: true, message: "Produk berhasil diperbarui di MongoDB." };
  } catch (error: any) {
    console.error("MongoDB Update Error:", error);
    return { success: false, message: error.message };
  }
}
