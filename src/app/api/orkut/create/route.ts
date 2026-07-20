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
 * API: Create Orderkuota QRIS Transaction with Strict Plan Validation
 * Method: POST
 * URL: /orkut/create (via api subdomain)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, amount, payer_email, description, external_id } = body;

    // 1. Basic Input Validation
    if (!secret_key || !amount) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: secret_key and amount are mandatory.' 
      }, { status: 400 });
    }

    const baseAmount = Number(amount);
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
    const orkutRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const orkutSnap = await getDoc(orkutRef);

    if (!orkutSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota service is not initialized for this account.' 
      }, { status: 403 });
    }

    const orkutData = orkutSnap.data();
    
    // --- STRICT PLAN CHECK ---
    let plan = (orkutData.plan || '').toLowerCase();
    if (!plan) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access Denied: No active subscription plan found.' 
      }, { status: 403 });
    }

    // --- EXPIRY CHECK ---
    if (plan !== 'enterprise') {
      if (!orkutData.planExpiry) {
        return NextResponse.json({ success: false, message: 'Access Denied: Invalid plan configuration.' }, { status: 403 });
      }
      const expiry = orkutData.planExpiry.toDate ? orkutData.planExpiry.toDate() : new Date(orkutData.planExpiry);
      if (new Date() > expiry) {
        return NextResponse.json({ 
          success: false, 
          message: 'Access Denied: Your subscription has expired. Please renew.' 
        }, { status: 403 });
      }
    }
    
    // --- RPM RATE LIMITING ---
    const rpmLimit = plan === 'pro' ? 100 : plan === 'premium' ? 300 : plan === 'enterprise' ? 999999 : 1;
    const now = Date.now();
    const lastReset = orkutData.rpmLastReset?.toMillis ? orkutData.rpmLastReset.toMillis() : 0;
    const requestsThisMinute = orkutData.rpmRequestsCount || 0;

    let updatedRpmCount = requestsThisMinute + 1;
    let shouldResetRpm = (now - lastReset) > 60000;

    if (shouldResetRpm) {
      updatedRpmCount = 1;
    } else if (requestsThisMinute >= rpmLimit) {
      return NextResponse.json({ 
        success: false, 
        message: `Rate limit exceeded: ${rpmLimit} RPM for ${plan} plan.` 
      }, { status: 429 });
    }

    // --- QUOTA LOGIC ---
    const currentQuota = orkutData.quota || 0;
    if (currentQuota <= 0 && plan !== 'enterprise') {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota API Quota Exceeded. Please upgrade your plan.' 
      }, { status: 429 });
    }

    if (!orkutData.baseQr) {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota service is not configured. Please set up BaseQr in dashboard.' 
      }, { status: 403 });
    }

    // 4. Generate Unique Nominal
    const digitSetting = Number(orkutData.randomDigit) || 3;
    let randomSuffix = digitSetting === 2 
      ? Math.floor(Math.random() * 90) + 10 
      : Math.floor(Math.random() * 900) + 100;

    const finalAmount = baseAmount + randomSuffix;
    const trxId = external_id || `OKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 5. Generate Dynamic QRIS Payload
    let qrString = "";
    try {
      qrString = createDynamicQrisString(orkutData.baseQr, finalAmount.toString());
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
      provider: 'Orderkuota',
      status: 'PENDING',
      amount: finalAmount,
      base_amount: baseAmount,
      random_code: randomSuffix,
      payerEmail: payer_email || 'guest@stspoint.id',
      description: description || 'Orderkuota Payment',
      payment_info: {
        qr_string: qrString,
        method: 'QRIS',
        provider: 'Orderkuota'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const historyData = {
      id: trxId,
      gameId: "INTERNAL",
      gameName: "Orderkuota",
      itemName: description || "Orderkuota QRIS Payment",
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
      updateDoc(orkutRef, {
        quota: plan === 'enterprise' ? currentQuota : increment(-1),
        rpmRequestsCount: updatedRpmCount,
        rpmLastReset: shouldResetRpm ? serverTimestamp() : orkutData.rpmLastReset || serverTimestamp(),
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
    console.error('API Orkut Create Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error: ' + (error.message || 'Unknown error') 
    }, { status: 500 });
  }
}
