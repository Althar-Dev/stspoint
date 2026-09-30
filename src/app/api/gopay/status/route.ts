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
import { getGoMerchantMutations } from '@/lib/gomerchant/mutation';

/**
 * API: Check GoPay Transaction Status with Strict Plan Validation
 * Method: POST
 * URL: /gopay/status (via api subdomain)
 * 
 * FIX: Implementasi pengecekan waktu mutasi agar tidak mengambil transaksi sebelumnya.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, external_id } = body;

    // 1. Basic Validation
    if (!secret_key || !external_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: secret_key and external_id are mandatory.' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();

    // 2. Authenticate Merchant via secretKey
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

    // 3. Fetch Service Config & Validate Plan
    const gomerchantRef = doc(firestore, 'users', userId, 'services', 'gomerchant');
    const gomerchantSnap = await getDoc(gomerchantRef);

    if (!gomerchantSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'GoPay service not initialized.' 
      }, { status: 403 });
    }

    const gomerchantData = gomerchantSnap.data();
    
    // --- STRICT PLAN CHECK ---
    let plan = (gomerchantData.plan || '').toLowerCase();
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access Denied: No active subscription plan found.' 
      }, { status: 403 });
    }

    // --- EXPIRY CHECK ---
    if (plan !== 'enterprise' && gomerchantData.planExpiry) {
      const expiry = gomerchantData.planExpiry.toDate ? gomerchantData.planExpiry.toDate() : new Date(gomerchantData.planExpiry);
      if (new Date() > expiry) {
        return NextResponse.json({ 
          success: false, 
          message: 'Access Denied: Your subscription has expired.' 
        }, { status: 403 });
      }
    }

    // --- RPM RATE LIMITING LOGIC ---
    const rpmLimit = plan === 'pro' ? 60 : plan === 'premium' ? 180 : plan === 'enterprise' ? 999999 : 1;
    const now = Date.now();
    const lastReset = gomerchantData.rpmLastReset?.toMillis ? gomerchantData.rpmLastReset.toMillis() : 0;
    const requestsThisMinute = gomerchantData.rpmRequestsCount || 0;

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
    const rawQuota = typeof gomerchantData.quota === 'number'
      ? gomerchantData.quota
      : parseInt(String(gomerchantData.quota || 0), 10) || 0;
    const isUnlimited = rawQuota >= 999999 || gomerchantData.isLifetime === true;

    if (!isUnlimited && rawQuota <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'API Quota Exceeded.' 
      }, { status: 429 });
    }

    // 4. Ambil Data Transaksi from global collection
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found.' 
      }, { status: 404 });
    }

    const transactionData = transactionSnap.data();

    // Consume Quota and update RPM state
    await updateDoc(gomerchantRef, {
      quota: isUnlimited
        ? rawQuota
        : (typeof gomerchantData.quota === 'number' ? increment(-1) : Math.max(0, rawQuota - 1)),
      rpmRequestsCount: updatedRpmCount,
      rpmLastReset: shouldResetRpm ? serverTimestamp() : gomerchantData.rpmLastReset || serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 5. Jika status sudah PAID, langsung kembalikan respon
    const paidStatuses = ['PAID', 'SETTLED', 'SUCCEEDED'];
    if (paidStatuses.includes(transactionData.status)) {
      return NextResponse.json({
        success: true,
        data: {
          external_id: transactionData.id,
          status: 'PAID',
          amount: transactionData.amount,
          paid_at: transactionData.updatedAt?.toDate ? transactionData.updatedAt.toDate() : transactionData.updatedAt,
          remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
        }
      });
    }

    // 6. Rekonsiliasi Live jika status masih PENDING
    if (transactionData.status === 'PENDING' && gomerchantData.token) {
      const mutationRes = await getGoMerchantMutations({
        access_token: gomerchantData.token,
        refresh_token: gomerchantData.refreshToken || "",
        x_uniqueid: gomerchantData.id,
        limit: 50
      });

      if (mutationRes.status === 'success' && mutationRes.data) {
        const mutations = mutationRes.data.mutations || [];
        
        // --- FIX: JANGAN CEK TRANSAKSI SEBELUMNYA ---
        // Ambil waktu pembuatan transaksi dalam milidetik
        const txCreatedAtMillis = transactionData.createdAt?.toMillis 
          ? transactionData.createdAt.toMillis() 
          : new Date(transactionData.createdAt).getTime();

        const match = mutations.find(m => {
          const mCreatedAtMillis = new Date(m.created_at).getTime();
          
          // Kriteria: Status PAID, Nominal Cocok, dan Waktu Mutasi >= Waktu Transaksi (-30s buffer)
          return m.status.toLowerCase() === 'paid' && 
                 Math.abs(m.amount - transactionData.amount) < 1 &&
                 mCreatedAtMillis >= (txCreatedAtMillis - 30000); 
        });

        if (match) {
          const userHistoryRef = doc(firestore, 'users', userId, 'transactions', external_id);
          const globalHistoryRef = doc(firestore, 'transactions', external_id);

          await Promise.all([
            updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: match.created_at,
              gm_trx_id: match.trx_id
            }),
            updateDoc(userHistoryRef, {
              status: 'Success',
              updatedAt: serverTimestamp()
            }),
            updateDoc(globalHistoryRef, {
              status: 'Success',
              updatedAt: serverTimestamp()
            })
          ]);

          if (mutationRes.data.token_refreshed) {
            await updateDoc(gomerchantRef, {
              token: mutationRes.data.new_access_token,
              refreshToken: mutationRes.data.new_refresh_token || gomerchantData.refreshToken,
              updatedAt: serverTimestamp()
            });
          }

          return NextResponse.json({
            success: true,
            data: {
              external_id: transactionData.id,
              status: 'PAID',
              amount: transactionData.amount,
              paid_at: match.created_at,
              message: 'Payment detected via live mutation.',
              remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
            }
          });
        }
      }
    }

    // 7. Kembalikan status saat ini
    return NextResponse.json({
      success: true,
      data: {
        external_id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        created_at: transactionData.createdAt?.toDate ? transactionData.createdAt.toDate() : transactionData.createdAt,
        remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
      }
    });

  } catch (error: any) {
    console.error('API GoPay Status Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}
