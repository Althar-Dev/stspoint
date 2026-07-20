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
import { getOrderkuotaPPOBPricelist, getMarkupRules, forwardOrderToOkeConnect, checkStatusOkeConnect, type OrkutPPOBProduct, type MarkupRule } from '@/service/orderkuota';
import { OKE_MEMBER_ID, OKE_PIN, OKE_PASSWORD } from '@/lib/orderkuota/init';

/**
 * Helper: Kalkulasi Harga Jual berdasarkan Aturan Markup
 */
function calculateSellPrice(product: OrkutPPOBProduct, rules: MarkupRule[], customAmount?: number) {
  const basePrice = customAmount !== undefined && customAmount > 0 ? customAmount : product.price;
  
  const specificProviderRules = rules.filter(r => r.targetProvider === product.provider);
  const globalRules = rules.filter(r => r.targetProvider === 'all');

  const findBestRule = (ruleSet: MarkupRule[]) => {
    const candidates = ruleSet.filter(r => {
      const min = r.minPrice || 0;
      const max = r.maxPrice || 999999999;
      return basePrice >= min && basePrice <= max;
    });

    return candidates.find(r => r.targetType === 'sku' && r.targetValue.toUpperCase() === product.buyer_sku_code.toUpperCase()) ||
           candidates.find(r => r.targetType === 'brand' && r.targetValue.toUpperCase() === product.brand.toUpperCase()) ||
           candidates.find(r => r.targetType === 'type' && r.targetValue.toLowerCase() === product.type.toLowerCase()) ||
           candidates.find(r => r.targetType === 'global');
  };

  const rule = findBestRule(specificProviderRules) || findBestRule(globalRules);
  
  if (!rule) return basePrice;

  if (rule.markupType === 'nominal') {
    return basePrice + rule.value;
  } else {
    return Math.ceil(basePrice * (1 + rule.value / 100));
  }
}

/**
 * API: PPOB Order Execution
 * URL: /api/ppob/order
 */
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
    
    // 1. Authenticate & Get Merchant Data
    const usersRef = collection(firestore, 'users');
    const authQuery = query(usersRef, where('secretKey', '==', secret_key));
    const authSnap = await getDocs(authQuery);

    if (authSnap.empty) {
      return NextResponse.json({ success: false, error: 'Authentication failed: Invalid secret_key' }, { status: 401 });
    }

    const userDoc = authSnap.docs[0];
    const userData = userDoc.data();
    const userId = userData.uid || userDoc.id;
    const userBalance = userData.balance || 0;

    // 2. Load Product & Markup Rules
    const [productsRes, markupRes] = await Promise.all([
      getOrderkuotaPPOBPricelist(),
      getMarkupRules()
    ]);

    const product = productsRes.data.find(p => p.buyer_sku_code.toUpperCase() === sku.toUpperCase());
    if (!product) {
      return NextResponse.json({ success: false, error: `Product SKU '${sku}' not found` }, { status: 404 });
    }

    const isPasca = product.type === 'Pasca';
    
    // 3. Calculate Final Selling Price
    // Jika Pasca, gunakan qty sebagai nominal pembayaran dasar
    const sellPrice = calculateSellPrice(product, markupRes.data || [], isPasca ? Number(qty) : undefined); 
    
    // 4. Check Balance for Prepaid orders
    if (!isPasca && userBalance < sellPrice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient account balance',
        current_balance: userBalance,
        required_amount: sellPrice
      }, { status: 403 });
    }

    // 5. Execute Bridge Order with strict Type discrimination
    const h2hRes = await forwardOrderToOkeConnect({
      type: isPasca ? 'Pasca' : 'Prepaid',
      product: sku,
      dest: target,
      refID: ref_id,
      memberID: OKE_MEMBER_ID,
      pin: OKE_PIN,
      password: OKE_PASSWORD,
      qty: isPasca ? Number(qty) : undefined
    });

    if (!h2hRes.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Upstream provider error: ' + h2hRes.message 
      }, { status: 400 });
    }

    // 6. Initial Status Sync
    const statusRes = await checkStatusOkeConnect({
      product: sku,
      dest: target,
      refID: ref_id,
      memberID: OKE_MEMBER_ID,
      pin: OKE_PIN,
      password: OKE_PASSWORD,
      qty: isPasca ? Number(qty) : undefined
    });

    const finalStatus = statusRes.success ? statusRes.status : 'Pending';

    // 7. Atomic Balance Deduction (Only for Prepaid)
    if (!isPasca) {
      await updateDoc(doc(firestore, 'users', userId), {
        balance: increment(-sellPrice),
        updatedAt: serverTimestamp()
      });
    }

    // 8. Record to Global Transaction Ledger
    const txData = {
      id: ref_id,
      gameId: product.brand,
      gameName: product.category,
      itemName: product.product_name,
      sku: sku,
      target: target,
      qty: qty || null,
      price: `Rp ${sellPrice.toLocaleString('id-ID')}`,
      priceAmount: sellPrice,
      userId: userId,
      status: finalStatus,
      callbackUrl: callbackUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      paymentMethod: 'API_H2H',
      provider_msg: statusRes.message || h2hRes.message,
      type: 'ppob',
      is_pasca: isPasca
    };

    const globalTxRef = doc(firestore, 'transactions', ref_id);
    const userTxRef = doc(firestore, 'users', userId, 'transactions', ref_id);

    await Promise.all([
      setDoc(globalTxRef, txData),
      setDoc(userTxRef, txData)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Transaction is being processed',
      data: {
        ref_id: ref_id,
        sku: sku,
        target: target,
        status: finalStatus,
        price: sellPrice,
        remaining_balance: !isPasca ? userBalance - sellPrice : userBalance
      }
    });

  } catch (error: any) {
    console.error('PPOB POST API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const [productsRes, markupRes] = await Promise.all([
      getOrderkuotaPPOBPricelist(),
      getMarkupRules()
    ]);

    if (!productsRes.success) {
      return NextResponse.json({ success: false, error: productsRes.message }, { status: 500 });
    }

    const rules = markupRes.data || [];
    
    let filtered = productsRes.data.map(p => ({
      ...p,
      price: calculateSellPrice(p, rules)
    }));

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