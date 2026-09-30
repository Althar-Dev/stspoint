
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
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { getOrderkuotaMutation } from '@/lib/orderkuota/mutation';

/**
 * API: Check Orderkuota Transaction Status
 * Method: POST
 * URL: /orkut/status (via api subdomain)
 * FIX: Aligned with working Console Action (parseFloat + dot-safe handling)
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
    const rawQuota = typeof orkutData.quota === 'number'
      ? orkutData.quota
      : parseInt(String(orkutData.quota || 0), 10) || 0;
    const isUnlimited = rawQuota >= 999999 || orkutData.isLifetime === true;

    if (!isUnlimited && rawQuota <= 0) {
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
      quota: isUnlimited
        ? rawQuota
        : (typeof orkutData.quota === 'number' ? increment(-1) : Math.max(0, rawQuota - 1)),
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
          remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
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
        const expectedAmount = Number(transactionData.amount);
        
        let foundMatch = null;

        for (const m of mutations) {
          // Robust parsing: Remove potential thousand dots to ensure match
          const rawKredit = String(m.kredit || "").trim();
          const cleanKredit = rawKredit.includes('.') && !rawKredit.includes(',') && rawKredit.split('.').pop()?.length === 3
             ? rawKredit.replace(/\./g, '')
             : rawKredit;
             
          const amount = parseFloat(cleanKredit);
          const isNominalMatch = m.status === 'IN' && Math.abs(amount - expectedAmount) < 1;

          if (isNominalMatch) {
            // Check global ledger (processed_topups) to ensure this mutation ID hasn't been claimed
            const ledgerRef = doc(firestore, 'processed_topups', m.id.toString());
            const ledgerSnap = await getDoc(ledgerRef);

            if (!ledgerSnap.exists()) {
              foundMatch = m;
              break;
            }
          }
        }

        if (foundMatch) {
          const userHistoryRef = doc(firestore, 'users', userId, 'transactions', external_id);
          const globalHistoryRef = doc(firestore, 'transactions', external_id);
          const ledgerRef = doc(firestore, 'processed_topups', foundMatch.id.toString());
          
          await Promise.all([
            updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: foundMatch.tanggal,
              orkut_trx_id: foundMatch.id
            }),
            updateDoc(userHistoryRef, {
              status: 'Success',
              updatedAt: serverTimestamp()
            }),
            updateDoc(globalHistoryRef, {
              status: 'Success',
              updatedAt: serverTimestamp()
            }),
            setDoc(ledgerRef, {
              userId,
              external_id,
              amount: expectedAmount,
              orkutTrxId: foundMatch.id,
              processedAt: serverTimestamp(),
              type: 'API_PAYMENT'
            })
          ]);

          return NextResponse.json({
            success: true,
            data: {
              external_id: transactionData.id,
              status: 'PAID',
              amount: transactionData.amount,
              paid_at: foundMatch.tanggal,
              message: 'Payment detected via live mutation.',
              remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
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
        remaining_quota: isUnlimited ? -1 : Math.max(0, rawQuota - 1)
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
