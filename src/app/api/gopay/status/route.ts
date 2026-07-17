
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

    // 3. Ambil Data Transaksi dari stspay_transactions
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found.' 
      }, { status: 404 });
    }

    const transactionData = transactionSnap.data();

    // Pastikan transaksi ini milik merchant yang merequest
    if (transactionData.userId !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied: You do not own this transaction.' 
      }, { status: 403 });
    }

    // 4. Jika status sudah PAID, langsung kembalikan respon
    const paidStatuses = ['PAID', 'SETTLED', 'SUCCEEDED'];
    if (paidStatuses.includes(transactionData.status)) {
      return NextResponse.json({
        success: true,
        data: {
          external_id: transactionData.id,
          status: 'PAID',
          amount: transactionData.amount,
          paid_at: transactionData.updatedAt?.toDate ? transactionData.updatedAt.toDate() : transactionData.updatedAt
        }
      });
    }

    // 5. Rekonsiliasi Live jika status masih PENDING
    if (transactionData.status === 'PENDING') {
      const gomerchantRef = doc(firestore, 'users', userId, 'services', 'gomerchant');
      const gomerchantSnap = await getDoc(gomerchantRef);

      if (gomerchantSnap.exists() && gomerchantSnap.data().token) {
        const gmData = gomerchantSnap.data();
        
        // Panggil bridge untuk mengambil mutasi terbaru dari GoBiz
        const mutationRes = await getGoMerchantMutations({
          access_token: gmData.token,
          refresh_token: gmData.refreshToken || "",
          x_uniqueid: gmData.id,
          limit: 50
        });

        if (mutationRes.status === 'success' && mutationRes.data) {
          const mutations = mutationRes.data.mutations || [];
          
          /**
           * STRATEGI REKONSILIASI:
           * Mencari mutasi masuk yang memiliki nominal yang persis sama dengan tagihan unik kita.
           * Perbandingan menggunakan Math.abs < 1 untuk menangani potensi perbedaan pembulatan float.
           */
          const match = mutations.find(m => 
            m.status.toLowerCase() === 'paid' && 
            Math.abs(m.amount - transactionData.amount) < 1
          );

          if (match) {
            // Update Firestore ke PAID jika ditemukan kecocokan nominal unik
            await updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: match.created_at,
              gm_trx_id: match.trx_id
            });

            // Update Token jika terjadi rotasi otomatis selama penarikan mutasi
            if (mutationRes.data.token_refreshed) {
              await updateDoc(gomerchantRef, {
                token: mutationRes.data.new_access_token,
                refreshToken: mutationRes.data.new_refresh_token || gmData.refreshToken,
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
                message: 'Payment detected and matched via live mutation.'
              }
            });
          }
        }
      }
    }

    // 6. Jika tidak ditemukan mutasi yang cocok, kembalikan status saat ini (PENDING)
    return NextResponse.json({
      success: true,
      data: {
        external_id: transactionData.id,
        status: transactionData.status,
        amount: transactionData.amount,
        created_at: transactionData.createdAt?.toDate ? transactionData.createdAt.toDate() : transactionData.createdAt
      }
    });

  } catch (error: any) {
    console.error('API GoPay Status Error:', error);
    return { 
      success: false, 
      message: 'Internal Server Error during status verification.' 
    };
  }
}
