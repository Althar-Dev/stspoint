
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Menggunakan variabel global untuk memastikan singleton di environment Next.js (Fast Refresh)
let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Inisialisasi Firestore dengan settings yang lebih stabil untuk browser
    firestore = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
  }

  return { firebaseApp: app, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './use-memo-firebase';
