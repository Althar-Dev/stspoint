import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { getOrderkuotaMutation } from '@/lib/orderkuota/mutation';

/**
 * API: Check Orderkuota Transaction Status
 * Method: POST
 * URL: /orkut/status (via api subdomain)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, external_id } = body;

    // 1. Validasi Input Dasar
    if (!secret_key || !external_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: secret_key and external_id are mandatory.' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 2. Autentikasi Merchant via secretKey
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication failed: Invalid secret_key.' 
      }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;

    // 3. Cek Konfigurasi Layanan & Validasi Plan
    const orkutRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const orkutSnap = await getDoc(orkutRef);

    if (!orkutSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota service is not initialized.' 
      }, { status: 403 });
    }

    const orkutData = orkutSnap.data();
    let plan = orkutData.plan;

    // --- STRICT PLAN & EXPIRY CHECK ---
    if (!plan) {
      return NextResponse.json({ success: false, message: 'Access Denied: No active plan found.' }, { status: 403 });
    }
    
    if (orkutData.planExpiry) {
      const expiry = orkutData.planExpiry.toDate ? orkutData.planExpiry.toDate() : new Date(orkutData.planExpiry);
      if (new Date() > expiry) {
        return NextResponse.json({ success: false, message: 'Access Denied: Plan has expired.' }, { status: 403 });
      }
    }

    plan = plan.toLowerCase();

    // --- RPM RATE LIMITING ---
    const rpmLimit = plan === 'pro' ? 100 : plan === 'premium' ? 300 : 1;
    const now = Date.now();
    const lastReset = orkutData.rpmLastReset?.toMillis() || 0;
    const requestsThisMinute = orkutData.rpmRequestsCount || 0;

    let updatedRpmCount = requestsThisMinute + 1;
    let shouldResetRpm = (now - lastReset) > 60000;

    if (shouldResetRpm) {
      updatedRpmCount = 1;
    } else if (requestsThisMinute >= rpmLimit) {
      return NextResponse.json({ 
        success: false, 
        message: `Rate limit exceeded: ${rpmLimit} RPM for ${plan} plan.` 
      }, { status: 429 });
    }

    // --- QUOTA CHECK ---
    const currentQuota = orkutData.quota || 0;
    if (currentQuota <= 0) {
      return NextResponse.json({ success: false, message: 'API Quota Exceeded.' }, { status: 429 });
    }

    // 4. Ambil Data Transaksi
    const transactionRef = doc(firestore, 'users', userId, 'services', 'orderkuota', 'transactions', external_id);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found.' 
      }, { status: 404 });
    }

    const transactionData = transactionSnap.data();

    // Update RPM & Quota state
    await updateDoc(orkutRef, {
      quota: increment(-1),
      rpmRequestsCount: updatedRpmCount,
      rpmLastReset: shouldResetRpm ? serverTimestamp() : orkutData.rpmLastReset || serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 5. Jika status sudah PAID, langsung kembalikan respon
    if (transactionData.status === 'PAID') {
      return NextResponse.json({
        success: true,
        data: {
          external_id: transactionData.id,
          status: 'PAID',
          amount: transactionData.amount,
          remaining_quota: currentQuota - 1
        }
      });
    }

    // 6. Rekonsiliasi Live jika status masih PENDING
    if (transactionData.status === 'PENDING' && orkutData.token) {
      const mutationRes = await getOrderkuotaMutation({
        username: orkutData.username,
        token: orkutData.token
      });

      if (mutationRes.status && mutationRes.result) {
        const mutations = mutationRes.result;
        const match = mutations.find(m => 
          m.status === 'IN' && 
          Math.abs(parseFloat(m.kredit) - transactionData.amount) < 1
        );

        if (match) {
          await updateDoc(transactionRef, {
            status: 'PAID',
            updatedAt: serverTimestamp(),
            paid_at: match.tanggal,
            orkut_trx_id: match.id
          });

          return NextResponse.json({
            success: true,
            data: {
              external_id: transactionData.id,
              status: 'PAID',
              amount: transactionData.amount,
              paid_at: match.tanggal,
              message: 'Payment detected via live mutation.',
              remaining_quota: currentQuota - 1
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        external_id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        created_at: transactionData.createdAt?.toDate ? transactionData.createdAt.toDate() : transactionData.createdAt,
        remaining_quota: currentQuota - 1
      }
    });

  } catch (error: any) {
    console.error('API Orkut Status Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}
