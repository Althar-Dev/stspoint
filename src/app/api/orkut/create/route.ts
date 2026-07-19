
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
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
 * API: Create Orderkuota QRIS Transaction
 * Method: POST
 * URL: /api/orkut/create
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret_key, amount, payer_email, description, external_id } = body;

    // 1. Validasi Input Dasar
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

    // 3. Cek Konfigurasi Layanan Orderkuota & Validasi Plan
    const orkutRef = doc(firestore, 'users', userId, 'services', 'orderkuota');
    const orkutSnap = await getDoc(orkutRef);

    if (!orkutSnap.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Orderkuota service is not initialized for this account.' 
      }, { status: 403 });
    }

    const orkutData = orkutSnap.data();
    let plan = (orkutData.plan || "starter").toLowerCase();

    // --- CEK EXPIRED ---
    if (orkutData.planExpiry && plan !== 'enterprise') {
      const expiry = orkutData.planExpiry.toDate ? orkutData.planExpiry.toDate() : new Date(orkutData.planExpiry);
      if (new Date() > expiry) {
        plan = "starter"; // Downgrade jika expired
      }
    }
    
    // --- LOGIKA RPM (Requests Per Minute) ---
    // Pro: 100, Premium: 300, Enterprise: Unlimited, Starter: 10
    const rpmLimit = plan === 'pro' ? 100 : plan === 'premium' ? 300 : plan === 'enterprise' ? 999999 : 10;
    const now = Date.now();
    const lastReset = orkutData.rpmLastReset?.toMillis() || 0;
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

    // --- LOGIKA KUOTA ---
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

    const baseQr = orkutData.baseQr;
    const digitSetting = Number(orkutData.randomDigit) || 3;

    // 4. Generate Kode Unik Nominal
    let randomSuffix = 0;
    if (digitSetting === 2) {
      randomSuffix = Math.floor(Math.random() * 90) + 10;
    } else {
      randomSuffix = Math.floor(Math.random() * 900) + 100;
    }

    const finalAmount = baseAmount + randomSuffix;
    const trxId = external_id || `OKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 5. Generate Payload QRIS Dinamis
    let qrString = "";
    try {
      qrString = createDynamicQrisString(baseQr, finalAmount.toString());
    } catch (e: any) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to generate dynamic QRIS: ' + e.message 
      }, { status: 500 });
    }

    // 6. Simpan Transaksi & Potong Kuota + Update RPM
    const transactionRef = doc(firestore, 'users', userId, 'services', 'orderkuota', 'transactions', trxId);
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

    await Promise.all([
      setDoc(transactionRef, transactionData),
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
        remaining_quota: plan === 'enterprise' ? -1 : currentQuota - 1,
        checkout_url: `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}/checkout/${trxId}`
      }
    });

  } catch (error: any) {
    console.error('API Orkut Create Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error.' }, { status: 500 });
  }
}
