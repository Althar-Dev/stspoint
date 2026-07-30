import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { transferToBank } from '@/lib/ovo/transfer';

/**
 * API: Execute Bank Transfer from OVO
 * Method: POST
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      secret_key, 
      account_name, 
      account_no, 
      account_no_destination, 
      amount, 
      bank_code, 
      bank_name, 
      message, 
      notes 
    } = body;

    if (!secret_key || !account_no || !amount || !bank_code) {
      return NextResponse.json({ success: false, message: 'Missing required parameters.' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 1. Auth
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) return NextResponse.json({ success: false, message: 'Auth failed.' }, { status: 401 });

    const userId = authSnap.docs[0].id;

    // 2. OVO Context
    const ovoSvcRef = doc(firestore, 'users', userId, 'services', 'ovo');
    const ovoSnap = await getDoc(ovoSvcRef);

    if (!ovoSnap.exists() || !ovoSnap.data().token) {
      return NextResponse.json({ success: false, message: 'OVO not connected.' }, { status: 403 });
    }

    const { token, deviceId } = ovoSnap.data();

    // 3. Execute Transfer
    const res = await transferToBank({
      token,
      deviceId,
      accountName: account_name,
      accountNo: account_no,
      accountNoDestination: account_no_destination || account_no,
      amount: Number(amount),
      bankCode: bank_code,
      bankName: bank_name || '',
      message: message || '',
      notes: notes || message || ''
    });

    return NextResponse.json(res);

  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Internal Error' }, { status: 500 });
  }
}
