import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { getOrderkuotaPPOBPricelist, forwardOrderToOkeConnect } from '@/service/orderkuota';
import { OKE_MEMBER_ID, OKE_PIN, OKE_PASSWORD } from '@/lib/orderkuota/init';

/**
 * API: PPOB Order & Product List
 * URL: /api/ppob/order
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // prepaid or pasca
    const secret_key = searchParams.get('secret_key');

    if (!secret_key) {
      return NextResponse.json({ success: false, error: 'secret_key is required as query parameter' }, { status: 401 });
    }

    const { firestore } = initializeFirebase();
    
    // Authenticate user via secretKey
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    // Fetch product list from SQLite
    const productsRes = await getOrderkuotaPPOBPricelist();
    if (!productsRes.success) {
      return NextResponse.json({ success: false, error: productsRes.message }, { status: 500 });
    }

    let filtered = productsRes.data;
    if (type) {
      const targetType = type.toLowerCase() === 'pasca' ? 'Pasca' : 'Prepaid';
      filtered = filtered.filter(p => p.type?.toLowerCase() === targetType.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      data: filtered
    });

  } catch (error: any) {
    console.error('PPOB GET API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, sku, target, ref_id, qty } = body;

    // 1. Validasi Input
    if (!secret_key || !sku || !target || !ref_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: secret_key, sku, target, ref_id' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    
    // 2. Autentikasi Merchant via Secret Key
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;
    const userBalance = userData.balance || 0;

    // 3. Validasi Produk di DB Lokal
    const productsRes = await getOrderkuotaPPOBPricelist();
    const product = productsRes.data.find(p => p.buyer_sku_code === sku);

    if (!product) {
      return NextResponse.json({ success: false, error: `Product SKU '${sku}' not found` }, { status: 404 });
    }

    if (!product.buyer_product_status) {
      return NextResponse.json({ success: false, error: 'Product is currently unavailable' }, { status: 400 });
    }

    // 4. Hitung Harga & Cek Saldo
    const price = product.price; 

    if (product.type === 'Prepaid' && userBalance < price) {
      return NextResponse.json({ success: false, error: 'Insufficient account balance' }, { status: 403 });
    }

    // 5. Teruskan Pesanan ke H2H OkeConnect menggunakan kredensial global ("Milik Kita")
    const h2hRes = await forwardOrderToOkeConnect({
      type: product.type === 'Pasca' ? 'Pasca' : 'Prepaid',
      product: sku,
      dest: target,
      refID: ref_id,
      memberID: OKE_MEMBER_ID,
      pin: OKE_PIN,
      password: OKE_PASSWORD,
      qty: product.type === 'Pasca' ? Number(qty) : undefined
    });

    if (!h2hRes.success) {
      return NextResponse.json({ 
        success: false, 
        message: h2hRes.message || 'H2H Provider rejected the request' 
      }, { status: 400 });
    }

    // 6. Potong Saldo Merchant (Hanya jika Prepaid)
    if (product.type === 'Prepaid') {
      await updateDoc(doc(firestore, 'users', userId), {
        balance: increment(-price),
        updatedAt: serverTimestamp()
      });
    }

    // 7. Catat Transaksi
    const txRef = doc(firestore, 'transactions', ref_id);
    await setDoc(txRef, {
      id: ref_id,
      gameId: product.brand,
      gameName: product.category,
      itemName: product.product_name,
      price: price.toString(),
      priceAmount: price,
      userId: userId,
      status: 'Pending',
      createdAt: serverTimestamp(),
      paymentMethod: 'H2H_API',
      raw_h2h_response: h2hRes.message
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction is being processed',
      data: {
        ref_id: ref_id,
        sku: sku,
        target: target,
        status: 'Pending',
        provider_message: h2hRes.message
      }
    });

  } catch (error: any) {
    console.error('PPOB POST API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
