
'use server';
/**
 * @fileOverview MongoDB Product Service for Web App Prem.
 * Handles secure connection using a direct URI input for Atlas compatibility.
 */

import { MongoClient } from 'mongodb';
import { initializeFirebase } from '@/firebase/core';
import { doc, getDoc } from 'firebase/firestore';

export async function getMongoProducts(userId: string, appId: string) {
  try {
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

    await client.connect();
    
    const database = client.db(mongoDb || 'test');
    const collection = database.collection(mongoCol || 'products');
    
    // Fetch all products from the specified collection
    const mongoProducts = await collection.find({}).toArray();
    await client.close();

    // Map data to ensure serializable IDs
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
    console.error("MongoDB Bridge Error:", error);
    return { 
      success: false, 
      message: `Gagal terhubung ke MongoDB: ${error.message || 'Koneksi Timeout'}`
    };
  }
}
