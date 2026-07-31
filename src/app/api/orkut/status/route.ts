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
 * Helper: Robustly parse Orderkuota credit string to integer.
 * Handles strings like "50000.00" or "50,000" correctly.
 */
const parseOrkutAmount = (val: any): number => {
    if (typeof val === 'number') return Math.floor(val);
    const str = String(val || "").trim();
    if (!str) return 0;
    // Remove thousand separators (comma or dot) but keep the last decimal separator if any
    // For Orkut, we usually just need the integer part
    return Math.floor(parseFloat(str.replace(/,/g, '')) || 0);
};

/**
 * API: Check Orderkuota Transaction Status
 * Method: POST
 * URL: /orkut/status (via api subdomain)
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

    // 3. Check Service Config & Validate Plan
    const orkutRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const orkutSnap = await getDoc(orkutRef);

    if (!orkutSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota service not initialized.' 
      }, { status: 403 });
    }

    const orkutData = orkutSnap.data();
    let plan = (orkutData.plan || '').toLowerCase();

    if (!plan) {
      return NextResponse.json({ success: false, message: 'Access Denied: No active plan found.' }, { status: 403 });
    }
    
    // --- RPM RATE LIMITING ---
    const rpmLimit = plan === 'pro' ? 100 : plan === 'premium' ? 300 : plan === 'enterprise' ? 999999 : 1;
    const now = Date.now();
    const lastReset = orkutData.rpmLastReset?.toMillis ? orkutData.rpmLastReset.toMillis() : 0;
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
    if (currentQuota <= 0 && plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        message: 'API Quota Exceeded.' 
      }, { status: 429 });
    }

    // 4. Fetch Transaction Data from global collection
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
    await updateDoc(orkutRef, {
      quota: plan === 'enterprise' ? currentQuota : increment(-1),
      rpmRequestsCount: updatedRpmCount,
      rpmLastReset: shouldResetRpm ? serverTimestamp() : orkutData.rpmLastReset || serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 5. If already PAID, return success immediately
    if (transactionData.status === 'PAID') {
      return NextResponse.json({
        success: true,
        data: {
          external_id: transactionData.id,
          status: 'PAID',
          amount: transactionData.amount,
          remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1
        }
      });
    }

    // 6. Live Reconciliation if still PENDING
    if (transactionData.status === 'PENDING' && orkutData.token) {
      const mutationRes = await getOrderkuotaMutation({
        username: orkutData.username,
        token: orkutData.token
      });

      if (mutationRes.status && mutationRes.result && Array.isArray(mutationRes.result)) {
        const mutations = mutationRes.result;
        
        // --- RECONCILIATION LOGIC ---
        const txCreatedAtMillis = transactionData.createdAt?.toMillis 
          ? transactionData.createdAt.toMillis() 
          : new Date(transactionData.createdAt).getTime();

        const match = mutations.find(m => {
          // Date parsing: "2024-10-24 08:42:11" -> Appending +07:00 (WIB) is crucial for accurate comparison
          const formattedDate = m.tanggal.replace(" ", "T") + "+07:00";
          const mCreatedAtMillis = new Date(formattedDate).getTime();
          const mAmount = parseOrkutAmount(m.kredit);
          
          // Match criteria: Status IN, Nominal Match, and Time within acceptable window (up to 30 mins before)
          return m.status.toUpperCase() === 'IN' && 
                 Math.abs(mAmount - Number(transactionData.amount)) < 1 &&
                 mCreatedAtMillis >= (txCreatedAtMillis - 1800000); 
        });

        if (match) {
          const userHistoryRef = doc(firestore, 'users', userId, 'transactions', external_id);
          const globalHistoryRef = doc(firestore, 'transactions', external_id);
          
          await Promise.all([
            updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: match.tanggal,
              orkut_trx_id: match.id
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

          return NextResponse.json({
            success: true,
            data: {
              external_id: transactionData.id,
              status: 'PAID',
              amount: transactionData.amount,
              paid_at: match.tanggal,
              message: 'Payment detected via live mutation.',
              remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1
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
        remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1
      }
    });

  } catch (error: any) {
    console.error('API Orkut Status Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}
