import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/core';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { createDynamicQrisString } from '@/lib/qris/dynamic';

/**
 * Robustly parse ShopeePay amount.
 * Normalizes input strings or numbers into clean integers.
 */
const parseShopeeAmount = (val: any): number => {
    if (val === null || val === undefined) return 0;
    
    let num: number;
    if (typeof val === 'number') {
        num = val;
    } else {
        let str = String(val).trim().replace(/[^\d.,]/g, '');
        if (str.includes('.') && str.includes(',')) {
            // European format: 1.234,56
            str = str.replace(/\./g, '').replace(',', '.');
        } else if (str.includes('.')) {
            // Check if dot is thousand separator (e.g. 5.000)
            const parts = str.split('.');
            if (parts[parts.length - 1].length === 3) {
                str = str.replace(/\./g, '');
            }
        } else if (str.includes(',')) {
            // Comma as decimal
            str = str.replace(',', '.');
        }
        num = parseFloat(str);
    }

    if (isNaN(num)) return 0;

    // Shopee shorthand detection: 5.17 often means 5170
    if (num > 0 && num < 1000 && !Number.isInteger(num)) {
        return Math.round(num * 1000);
    }
    
    // If it's a very small integer (e.g. 5), but we are in a top-up context where min is 100, 
    // it's likely a misparsed thousand (5.000 -> 5).
    // However, during CREATE, we usually get the full number from the merchant UI.
    return Math.floor(num);
};

/**
 * API: Create ShopeePay QRIS Transaction
 * Method: POST
 * URL: /shopee/create (via api subdomain)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, amount, payer_email, description, external_id } = body;

    // 1. Basic Validation
    if (!secret_key || !amount) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: secret_key and amount are mandatory.' 
      }, { status: 400 });
    }

    const baseAmount = parseShopeeAmount(amount);
    
    if (isNaN(baseAmount) || baseAmount < 100) {
      return NextResponse.json({ 
        success: false, 
        message: 'Amount must be at least 100.' 
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

    // 3. Check Service Config & Plan Validation
    const shopeepayRef = doc(firestore, 'users', userId, 'services', 'shopeepay');
    const shopeepaySnap = await getDoc(shopeepayRef);

    if (!shopeepaySnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'ShopeePay service is not initialized for this account.' 
      }, { status: 403 });
    }

    const shopeepayData = shopeepaySnap.data();
    
    // --- STRICT PLAN CHECK ---
    let plan = (shopeepayData.plan || '').toLowerCase();
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access Denied: No active subscription plan found.' 
      }, { status: 403 });
    }

    // --- EXPIRY CHECK ---
    if (plan !== 'enterprise') {
      if (!shopeepayData.planExpiry) {
        return NextResponse.json({ success: false, message: 'Access Denied: Invalid plan configuration.' }, { status: 403 });
      }
      const expiry = shopeepayData.planExpiry.toDate ? shopeepayData.planExpiry.toDate() : new Date(shopeepayData.planExpiry);
      if (new Date() > expiry) {
        return NextResponse.json({ 
          success: false, 
          message: 'Access Denied: Your subscription has expired. Please renew.' 
        }, { status: 403 });
      }
    }
    
    // --- RPM RATE LIMITING ---
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
        message: `Rate limit exceeded: ${rpmLimit} RPM for ${plan} plan. Please slow down.` 
      }, { status: 429 });
    }

    // --- TOTAL QUOTA LOGIC ---
    const currentQuota = shopeepayData.quota || 0;
    if (currentQuota <= 0 && plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        message: 'API Quota Exceeded. Please upgrade your plan in the dashboard.' 
      }, { status: 429 });
    }

    if (!shopeepayData.baseQr) {
      return NextResponse.json({ 
        success: false, 
        message: 'ShopeePay service is not configured. Please set up BaseQr in your dashboard.' 
      }, { status: 403 });
    }

    const baseQr = shopeepayData.baseQr;
    const digitSetting = Number(shopeepayData.randomDigit) || 3;

    // 4. Generate Unique Nominal (Random Code)
    let randomSuffix = digitSetting === 2 
      ? Math.floor(Math.random() * 90) + 10 
      : Math.floor(Math.random() * 900) + 100;

    const finalAmount = baseAmount + randomSuffix;
    const trxId = external_id || `SPP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 5. Generate Dynamic QRIS Payload
    let qrString = "";
    try {
      qrString = createDynamicQrisString(baseQr, finalAmount.toString());
    } catch (e: any) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to generate QRIS: ' + e.message 
      }, { status: 500 });
    }

    // 6. Record Transaction & Update Quota
    const transactionRef = doc(firestore, 'stspay_transactions', trxId);
    const globalHistoryRef = doc(firestore, 'transactions', trxId);
    const userHistoryRef = doc(firestore, 'users', userId, 'transactions', trxId);

    const transactionData = {
      id: trxId,
      userId: userId,
      type: 'payment',
      provider: 'ShopeePay',
      status: 'PENDING',
      amount: finalAmount,
      base_amount: baseAmount,
      random_code: randomSuffix,
      payerEmail: payer_email || 'guest@stspoint.id',
      description: description || 'ShopeePay Payment',
      payment_info: {
        qr_string: qrString,
        method: 'QRIS',
        provider: 'ShopeePay'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const historyData = {
      id: trxId,
      gameId: "INTERNAL",
      gameName: "ShopeePay",
      itemName: description || "ShopeePay QRIS Payment",
      price: `Rp ${finalAmount.toLocaleString('id-ID')}`,
      priceAmount: finalAmount,
      userId: userId,
      payerEmail: payer_email || 'guest@stspoint.id',
      status: "Pending",
      paymentMethod: "QRIS",
      createdAt: serverTimestamp()
    };

    await Promise.all([
      setDoc(transactionRef, transactionData),
      setDoc(globalHistoryRef, historyData),
      setDoc(userHistoryRef, historyData),
      updateDoc(shopeepayRef, {
        quota: plan === 'enterprise' ? currentQuota : increment(-1),
        rpmRequestsCount: updatedRpmCount,
        rpmLastReset: shouldResetRpm ? serverTimestamp() : shopeepayData.rpmLastReset || serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        external_id: trxId,
        qr_string: qrString,
        amount: finalAmount,
        base_amount: baseAmount,
        random_code: randomSuffix,
        status: 'PENDING',
        remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1
      }
    });

  } catch (error: any) {
    console.error('API Shopee Create Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}
