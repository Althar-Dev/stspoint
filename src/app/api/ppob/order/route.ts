import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
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
import { getOrderkuotaPPOBPricelist, forwardOrderToOkeConnect, checkStatusOkeConnect } from '@/service/orderkuota';
import { OKE_MEMBER_ID, OKE_PIN, OKE_PASSWORD } from '@/lib/orderkuota/init';

/**
 * API: PPOB Order & Product List
 * URL: /ppob/order (via api subdomain)
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const secret_key = searchParams.get('secret_key');

    if (!secret_key) {
      return NextResponse.json({ success: false, error: 'secret_key is required as query parameter' }, { status: 401 });
    }

    const { firestore } = initializeFirebase();
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    const productsRes = await getOrderkuotaPPOBPricelist();
    if (!productsRes.success) {
      return NextResponse.json({ success: false, error: productsRes.message }, { status: 500 });
    }

    let filtered = productsRes.data;
    if (type) {
      const targetType = type.toLowerCase() === 'pasca' ? 'Pasca' : 'Prepaid';
      filtered = filtered.filter(p => p.type?.toLowerCase() === targetType.toLowerCase());
    }

    return NextResponse.json({ success: true, data: filtered });

  } catch (error: any) {
    console.error('PPOB GET API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, sku, target, ref_id, qty } = body;

    const callbackUrl = request.headers.get('x-callback-url');

    if (!secret_key || !sku || !target || !ref_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: secret_key, sku, target, ref_id' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;
    const userBalance = userData.balance || 0;

    const productsRes = await getOrderkuotaPPOBPricelist();
    const product = productsRes.data.find(p => p.buyer_sku_code === sku);

    if (!product) {
      return NextResponse.json({ success: false, error: `Product SKU '${sku}' not found` }, { status: 404 });
    }

    const price = product.price; 
    if (product.type === 'Prepaid' && userBalance < price) {
      return NextResponse.json({ success: false, error: 'Insufficient account balance' }, { status: 403 });
    }

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
      return NextResponse.json({ success: false, message: h2hRes.message }, { status: 400 });
    }

    const statusRes = await checkStatusOkeConnect({
      product: sku,
      dest: target,
      refID: ref_id,
      memberID: OKE_MEMBER_ID,
      pin: OKE_PIN,
      password: OKE_PASSWORD,
      qty: product.type === 'Pasca' ? Number(qty) : undefined
    });

    const finalStatus = statusRes.success ? statusRes.status : 'Pending';

    if (product.type === 'Prepaid') {
      await updateDoc(doc(firestore, 'users', userId), {
        balance: increment(-price),
        updatedAt: serverTimestamp()
      });
    }

    const txRef = doc(firestore, 'transactions', ref_id);
    await setDoc(txRef, {
      id: ref_id,
      gameId: product.brand,
      gameName: product.category,
      itemName: product.product_name,
      sku: sku,
      target: target,
      qty: qty || null,
      price: price.toString(),
      priceAmount: price,
      userId: userId,
      status: finalStatus,
      callbackUrl: callbackUrl || null,
      createdAt: serverTimestamp(),
      paymentMethod: 'H2H_API',
      provider_msg: statusRes.message || h2hRes.message
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction is being processed',
      data: {
        ref_id: ref_id,
        sku: sku,
        target: target,
        status: finalStatus
      }
    });

  } catch (error: any) {
    console.error('PPOB POST API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
