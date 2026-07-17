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
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { getOrderkuotaPPOBPricelist, createOrderkuotaPPOBTransaction } from '@/service/orderkuota';

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
    const { secret_key, sku, target, ref_id } = body;

    if (!secret_key || !sku || !target || !ref_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: secret_key, sku, target, ref_id' 
      }, { status: 400 });
    }

    const { firestore } = initializeFirebase();
    
    // 1. Authenticate Merchant
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    const userData = authSnap.docs[0].data();
    const userId = userData.uid;
    const userBalance = userData.balance || 0;

    // 2. Validate Product
    const productsRes = await getOrderkuotaPPOBPricelist();
    const product = productsRes.data.find(p => p.buyer_sku_code === sku);

    if (!product) {
      return NextResponse.json({ success: false, error: `Product SKU '${sku}' not found` }, { status: 404 });
    }

    if (!product.buyer_product_status) {
      return NextResponse.json({ success: false, error: 'Product is currently unavailable' }, { status: 400 });
    }

    const price = product.price;

    if (userBalance < price) {
      return NextResponse.json({ success: false, error: 'Insufficient account balance' }, { status: 403 });
    }

    // 3. Get Service Configuration (credentials for provider bridge)
    const serviceRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const serviceSnap = await getDoc(serviceRef);
    
    if (!serviceSnap.exists() || !serviceSnap.data().token) {
      return NextResponse.json({ success: false, error: 'Orderkuota service is not connected for this account' }, { status: 400 });
    }

    const serviceData = serviceSnap.data();

    // 4. Execute Transaction to Provider
    const providerRes = await createOrderkuotaPPOBTransaction({
      username: serviceData.username,
      token: serviceData.token,
      sku: sku,
      target: target,
      ref_id: ref_id
    });

    if (!providerRes.success) {
      return NextResponse.json({ 
        success: false, 
        message: providerRes.message || 'Provider rejected the transaction' 
      }, { status: 400 });
    }

    // 5. Update Database (Deduct balance and log transaction)
    await updateDoc(doc(firestore, 'users', userId), {
      balance: increment(-price),
      updatedAt: serverTimestamp()
    });

    const txRef = doc(firestore, 'transactions', ref_id);
    await setDoc(txRef, {
      id: ref_id,
      gameId: product.brand,
      gameName: product.category,
      itemName: product.product_name,
      price: price.toString(),
      priceAmount: price,
      userId: userId,
      status: 'Success',
      createdAt: serverTimestamp(),
      paymentMethod: 'API_H2H'
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction has been processed',
      data: {
        ref_id: ref_id,
        sku: sku,
        target: target,
        price: price,
        status: 'Success',
        provider_response: providerRes.data
      }
    });

  } catch (error: any) {
    console.error('PPOB POST API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
