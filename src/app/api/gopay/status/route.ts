
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
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
 * API: Check GoPay Transaction Status (with Live Reconciliation)
 * Method: POST
 * URL: /api/gopay/status
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

    // 3. Fetch Service Config & Check Quota
    const gomerchantRef = doc(firestore, 'users', userId, 'services', 'gomerchant');
    const gomerchantSnap = await getDoc(gomerchantRef);

    if (!gomerchantSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'GoPay service not initialized.' 
      }, { status: 403 });
    }

    const gomerchantData = gomerchantSnap.data();
    const currentQuota = gomerchantData.quota || 0;
    const plan = gomerchantData.plan || "";

    if (currentQuota <= 0 && plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        message: 'API Quota Exceeded. Please upgrade your plan.' 
      }, { status: 429 });
    }

    // 4. Ambil Data Transaksi
    const transactionRef = doc(firestore, 'users', userId, 'services', 'gomerchant', 'transactions', external_id);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found for this account.' 
      }, { status: 404 });
    }

    const transactionData = transactionSnap.data();

    // Consume Quota for status check request
    await updateDoc(gomerchantRef, {
      quota: increment(-1),
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
          remaining_quota: currentQuota - 1
        }
      });
    }

    // 6. Rekonsiliasi Live jika status masih PENDING
    if (transactionData.status === 'PENDING' && gomerchantData.token) {
      // Panggil bridge untuk mengambil mutasi terbaru dari GoBiz
      const mutationRes = await getGoMerchantMutations({
        access_token: gomerchantData.token,
        refresh_token: gomerchantData.refreshToken || "",
        x_uniqueid: gomerchantData.id,
        limit: 50
      });

      if (mutationRes.status === 'success' && mutationRes.data) {
        const mutations = mutationRes.data.mutations || [];
        
        // REKONSILIASI: Cari mutasi yang cocok dengan nominal unik
        const match = mutations.find(m => 
          m.status.toLowerCase() === 'paid' && 
          Math.abs(m.amount - transactionData.amount) < 1
        );

        if (match) {
          // Update Firestore ke PAID
          await updateDoc(transactionRef, {
            status: 'PAID',
            updatedAt: serverTimestamp(),
            paid_at: match.created_at,
            gm_trx_id: match.trx_id
          });

          // Update Token jika terjadi rotasi otomatis
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
              message: 'Payment detected and matched via live mutation.',
              remaining_quota: currentQuota - 1
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
        remaining_quota: currentQuota - 1
      }
    });

  } catch (error: any) {
    console.error('API GoPay Status Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error during status verification.' 
    }, { status: 500 });
  }
}
