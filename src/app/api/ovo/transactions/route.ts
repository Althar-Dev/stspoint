import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getOvoMutations } from '@/lib/ovo/data';

/**
 * API: Fetch OVO Transaction History
 * Method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, page = 1, limit = 10 } = body;

    if (!secret_key) {
      return NextResponse.json({ success: false, message: 'secret_key is required.' }, { status: 401 });
    }

    const { firestore } = initializeFirebase();

    // 1. Authenticate Merchant
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, message: 'Authentication failed: Invalid secret_key.' }, { status: 401 });
    }

    const userId = authSnap.docs[0].id;

    // 2. Fetch OVO Service Config
    const ovoSvcRef = doc(firestore, 'users', userId, 'services', 'ovo');
    const ovoSnap = await getDoc(ovoSvcRef);

    if (!ovoSnap.exists() || !ovoSnap.data().token) {
      return NextResponse.json({ success: false, message: 'OVO service not connected or initialized.' }, { status: 403 });
    }

    const { token, deviceId } = ovoSnap.data();

    // 3. Call OVO Bridge
    const res = await getOvoMutations({ token, deviceId, page, limit });

    return NextResponse.json(res);

  } catch (error: any) {
    console.error('API OVO Transactions Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
