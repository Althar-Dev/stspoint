import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { checkOrderkuotaPPOBStatus } from '@/service/orderkuota';

/**
 * API: PPOB Transaction Status Check
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

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;

    // 3. Ambil Konfigurasi Service (Kredensial Provider)
    const serviceRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const serviceSnap = await getDoc(serviceRef);
    
    if (!serviceSnap.exists() || !serviceSnap.data().token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Orderkuota service is not connected for this account' 
      }, { status: 400 });
    }

    const serviceData = serviceSnap.data();

    // 4. Cek Status ke Provider Bridge
    const statusRes = await checkOrderkuotaPPOBStatus({
      username: serviceData.username,
      token: serviceData.token,
      ref_id: ref_id
    });

    // 5. Kembalikan Respon
    return NextResponse.json({
      success: statusRes.success,
      message: statusRes.message,
      data: statusRes.data // Berisi detail transaksi dari provider (status, sn, target, dll)
    });

  } catch (error: any) {
    console.error('PPOB Status API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
