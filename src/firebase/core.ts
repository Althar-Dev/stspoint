import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * @fileOverview Core Firebase Initialization.
 * Safe for both Server (Actions/Routes) and Client use.
 */

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

export function initializeFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    auth = getAuth(app);
  } else {
    app = getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
  }

  return { firebaseApp: app, firestore, auth };
}
