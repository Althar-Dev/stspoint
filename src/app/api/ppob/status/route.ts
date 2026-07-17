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
import { checkStatusOkeConnect } from '@/service/orderkuota';
import { OKE_MEMBER_ID, OKE_PIN, OKE_PASSWORD } from '@/lib/orderkuota/init';

/**
 * API: PPOB Transaction Status Check (Live H2H)
 * URL: /api/ppob/status?secret_key=...&ref_id=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret_key = searchParams.get('secret_key');
    const ref_id = searchParams.get('ref_id');

    // 1. Validasi Parameter
    if (!secret_key) {
      return NextResponse.json({ success: false, error: 'secret_key is required' }, { status: 401 });
    }

    if (!ref_id) {
      return NextResponse.json({ success: false, error: 'ref_id is required' }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    
    // 2. Autentikasi User via secretKey
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    // 3. Ambil Data Transaksi dari Firestore
    const txRef = doc(firestore, 'transactions', ref_id);
    const txSnap = await getDoc(txRef);
    
    if (!txSnap.exists()) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const txData = txSnap.data();

    // 4. Cek Status Langsung ke Upstream (OkeConnect) menggunakan platform credentials
    const statusRes = await checkStatusOkeConnect({
      product: txData.sku,
      dest: txData.target,
      refID: ref_id,
      memberID: OKE_MEMBER_ID,
      pin: OKE_PIN,
      password: OKE_PASSWORD,
      qty: txData.qty ? Number(txData.qty) : undefined
    });

    if (statusRes.success) {
      // 5. Update Status di Firestore jika ada perubahan
      if (statusRes.status !== txData.status) {
        await updateDoc(txRef, {
          status: statusRes.status,
          provider_msg: statusRes.message,
          updatedAt: serverTimestamp()
        });
      }
    }

    // 6. Kembalikan Respon
    return NextResponse.json({
      success: statusRes.success,
      status: statusRes.status,
      message: statusRes.message,
      data: {
        ref_id: ref_id,
        sku: txData.sku,
        target: txData.target,
        status: statusRes.status
      }
    });

  } catch (error: any) {
    console.error('PPOB Status API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
