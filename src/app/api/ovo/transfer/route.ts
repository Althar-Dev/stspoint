import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { transferToOvo } from '@/lib/ovo/transfer';

/**
 * API: Execute OVO to OVO Transfer
 * Method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, phone, amount, message } = body;

    if (!secret_key || !phone || !amount) {
      return NextResponse.json({ success: false, message: 'Missing parameters.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 1. Authenticate Merchant
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, message: 'Auth failed.' }, { status: 401 });
    }

    const userId = authSnap.docs[0].id;

    // 2. Fetch OVO Credentials
    const ovoSvcRef = doc(firestore, 'users', userId, 'services', 'ovo');
    const ovoSnap = await getDoc(ovoSvcRef);

    if (!ovoSnap.exists() || !ovoSnap.data().token) {
      return NextResponse.json({ success: false, message: 'OVO not connected.' }, { status: 403 });
    }

    const { token, deviceId } = ovoSnap.data();

    // 3. Call Bridge
    const res = await transferToOvo({ token, deviceId, phone, amount: Number(amount), message });

    return NextResponse.json(res);

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
