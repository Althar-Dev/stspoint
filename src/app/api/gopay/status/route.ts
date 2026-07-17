
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

    // 3. Fetch Transaction Data
    const transactionRef = doc(firestore, 'stspay_transactions', external_id);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction not found.' 
      }, { status: 404 });
    }

    const transactionData = transactionSnap.data();

    // Ensure the transaction belongs to the requesting merchant
    if (transactionData.userId !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied: You do not own this transaction.' 
      }, { status: 403 });
    }

    // 4. If status is already PAID, return immediately
    if (transactionData.status === 'PAID' || transactionData.status === 'SETTLED' || transactionData.status === 'SUCCEEDED') {
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

    // 5. If status is PENDING, attempt live reconciliation with GoMerchant
    if (transactionData.status === 'PENDING') {
      const gomerchantRef = doc(firestore, 'users', userId, 'services', 'gomerchant');
      const gomerchantSnap = await getDoc(gomerchantRef);

      if (gomerchantSnap.exists() && gomerchantSnap.data().token) {
        const gmData = gomerchantSnap.data();
        
        // Fetch last 50 mutations from GoBiz
        const mutationRes = await getGoMerchantMutations({
          access_token: gmData.token,
          refresh_token: gmData.refreshToken || "",
          x_uniqueid: gmData.id,
          limit: 50
        });

        if (mutationRes.status === 'success' && mutationRes.data) {
          const mutations = mutationRes.data.mutations || [];
          
          // Strategy: Match by exact unique amount
          const match = mutations.find(m => Math.abs(m.amount - transactionData.amount) < 1);

          if (match) {
            // Update Firestore to PAID
            await updateDoc(transactionRef, {
              status: 'PAID',
              updatedAt: serverTimestamp(),
              paid_at: match.created_at,
              gm_trx_id: match.trx_id
            });

            // Update Tokens if they were refreshed during mutation fetch
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
                paid_at: match.created_at
              }
            });
          }
        }
      }
    }

    // 6. Return current status if no match found
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
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error during status check.' 
    }, { status: 500 });
  }
}
