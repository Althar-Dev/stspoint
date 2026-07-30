import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getOvoBankList } from '@/lib/ovo/transfer';

/**
 * API: Get Supported Bank List
 * Method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key } = body;

    if (!secret_key) {
      return NextResponse.json({ success: false, message: 'secret_key is required.' }, { status: 401 });
    }

    const { firestore } = initializeFirebase();

    // 1. Authenticate
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, message: 'Auth failed.' }, { status: 401 });
    }

    const userId = authSnap.docs[0].id;

    // 2. Get OVO context to use the bridge
    const ovoSvcRef = doc(firestore, 'users', userId, 'services', 'ovo');
    const ovoSnap = await getDoc(ovoSvcRef);

    if (!ovoSnap.exists() || !ovoSnap.data().token) {
      return NextResponse.json({ success: false, message: 'Service context not available.' }, { status: 403 });
    }

    const { token, deviceId } = ovoSnap.data();

    // 3. Call Bridge
    const res = await getOvoBankList({ token, deviceId });

    return NextResponse.json(res);

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
