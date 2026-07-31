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
import { getShopeeMutations } from '@/lib/shopeepay/mutasi';

/**
 * Robustly parse ShopeePay amount from mutation data.
 * Returns the raw numerical value.
 */
const parseShopeeAmount = (val: any): number => {
    if (val === null || val === undefined) return 0;
    
    let num: number;
    if (typeof val === 'number') {
        num = val;
    } else {
        let str = String(val).trim().replace(/[^\d.,]/g, '');
        if (str.includes('.') && str.includes(',')) {
            // European: 1.234,56
            str = str.replace(/\./g, '').replace(',', '.');
        } else if (str.includes('.')) {
            const parts = str.split('.');
            // If it has 3 digits after dot, it's likely thousand separator (5.000)
            if (parts[parts.length - 1].length === 3) {
                str = str.replace(/\./g, '');
            }
        } else if (str.includes(',')) {
            str = str.replace(',', '.');
        }
        num = parseFloat(str);
    }

    if (isNaN(num)) return 0;
    return num;
};

/**
 * API: Check ShopeePay Transaction Status
 * Method: POST
 * URL: /shopee/status (via api subdomain)
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
    const shopeepayRef = doc(firestore, 'users', userId, 'services', 'shopeepay');
    const shopeepaySnap = await getDoc(shopeepayRef);

    if (!shopeepaySnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'ShopeePay service not initialized.' 
      }, { status: 403 });
    }

    const shopeepayData = shopeepaySnap.data();
    let plan = (shopeepayData.plan || '').toLowerCase();

    if (!plan) {
      return NextResponse.json({ success: false, message: 'Access Denied: No active plan found.' }, { status: 403 });
    }
    
    // --- RPM RATE LIMITING LOGIC ---
    const rpmLimit = plan === 'pro' ? 60 : plan === 'premium' ? 180 : plan === 'enterprise' ? 999999 : 1;
    const now = Date.now();
    const lastReset = shopeepayData.rpmLastReset?.toMillis ? shopeepayData.rpmLastReset.toMillis() : 0;
    const requestsThisMinute = shopeepayData.rpmRequestsCount || 0;

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
    const currentQuota = shopeepayData.quota || 0;
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
    await updateDoc(shopeepayRef, {
      quota: plan === 'enterprise' ? currentQuota : increment(-1),
      rpmRequestsCount: updatedRpmCount,
      rpmLastReset: shouldResetRpm ? serverTimestamp() : shopeepayData.rpmLastReset || serverTimestamp(),
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
    if (transactionData.status === 'PENDING' && shopeepayData.token) {
      const mutationRes = await getShopeeMutations({
        token: shopeepayData.token,
        limit: 50
      });

      if (mutationRes.success && Array.isArray(mutationRes.data)) {
        const mutations = mutationRes.data;
        const targetAmount = Number(transactionData.amount);
        
        // Match criteria: Amount match and Status SUCCESS
        // We handle shorthand (5.17 -> 5170) and truncated (5.000 -> 5) formats
        const match = mutations.find(m => {
          const mAmount = parseShopeeAmount(m.amount);
          const isSuccess = String(m.status).toUpperCase() === 'SUCCESS';
          
          const directMatch = Math.abs(mAmount - targetAmount) < 1;
          const thousandMatch = Math.abs((mAmount * 1000) - targetAmount) < 1;
          
          return isSuccess && (directMatch || thousandMatch);
        });

        if (match) {
          const userHistoryRef = doc(firestore, 'users', userId, 'transactions', external_id);
          const globalHistoryRef = doc(firestore, 'transactions', external_id);

          await Promise.all([
            updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: match.created_at,
              shopee_trx_id: match.transaction_id
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
              paid_at: match.created_at,
              message: 'Payment detected via live mutation.',
              remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1
            }
          });
        }
      }
    }

    // 7. Return current status
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
    console.error('API Shopee Status Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}
