'use server';
/**
 * @fileOverview Server Actions for Console Dashboard.
 * Menangani verifikasi top-up real-time berdasarkan nominal unik.
 */

import { initializeFirebase } from '@/firebase/core';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  increment, 
  serverTimestamp, 
  setDoc 
} from 'firebase/firestore';
import { getOrderkuotaMutation } from '@/lib/orderkuota/mutation';

/**
 * Memverifikasi pembayaran top-up berdasarkan nominal unik.
 * Fokus utama pada nominal yang pas dan pengecekan ledger agar tidak double claim.
 */
export async function checkTopUpStatusAction(userId: string, expectedAmount: number) {
  try {
    const { firestore } = initializeFirebase();
    
    // 1. Ambil konfigurasi master bridge
    const masterRef = doc(firestore, 'settings', 'orderkuota');
    const masterSnap = await getDoc(masterRef);
    
    if (!masterSnap.exists() || !masterSnap.data().token) {
      throw new Error("Sistem Bridge Master belum dikonfigurasi.");
    }
    
    const master = masterSnap.data();

    // 2. Tarik mutasi terbaru
    const mutationRes = await getOrderkuotaMutation({
      username: master.username,
      token: master.token
    });

    if (!mutationRes.status || !mutationRes.result) {
      throw new Error(mutationRes.message || "Gagal mengambil data dari provider.");
    }

    // 3. Cari mutasi 'IN' yang nominalnya cocok
    let foundMatch = null;

    for (const m of mutationRes.result) {
      const amount = parseFloat(m.kredit);
      const isNominalMatch = m.status === 'IN' && Math.abs(amount - expectedAmount) < 1;

      if (isNominalMatch) {
        // Cek apakah ID mutasi ini sudah pernah diklaim
        const ledgerRef = doc(firestore, 'processed_topups', m.id.toString());
        const ledgerSnap = await getDoc(ledgerRef);

        if (!ledgerSnap.exists()) {
          foundMatch = m;
          break;
        }
      }
    }

    if (!foundMatch) {
      return { 
        success: false, 
        message: `Pembayaran Rp ${expectedAmount.toLocaleString('id-ID')} belum masuk. Pastikan transfer nominal yang sesuai.` 
      };
    }

    // 4. Eksekusi penambahan saldo & Pencatatan Transaksi
    const userRef = doc(firestore, 'users', userId);
    const ledgerRef = doc(firestore, 'processed_topups', foundMatch.id.toString());
    const txId = `TOPUP-${foundMatch.id}`;
    
    // Referensi untuk global dan sub-koleksi user
    const txRef = doc(firestore, 'transactions', txId);
    const userTxRef = doc(firestore, 'users', userId, 'transactions', txId);
    
    const transactionData = {
      id: txId,
      gameId: "INTERNAL",
      gameName: "Wallet",
      itemName: `Top Up Saldo via ${foundMatch.brand?.name || 'QRIS'}`,
      price: expectedAmount.toString(),
      priceAmount: expectedAmount,
      userId: userId,
      status: "Success",
      createdAt: serverTimestamp(),
      paymentMethod: "QRIS_AUTO"
    };
    
    await Promise.all([
      updateDoc(userRef, {
        balance: increment(expectedAmount),
        updatedAt: serverTimestamp()
      }),
      setDoc(ledgerRef, {
        userId,
        amount: expectedAmount,
        orkutTrxId: foundMatch.id,
        bank: foundMatch.brand?.name || 'Unknown',
        processedAt: serverTimestamp(),
        rawMutation: foundMatch
      }),
      // Mencatat di tabel global untuk admin/audit
      setDoc(txRef, transactionData),
      // Mencatat di sub-koleksi spesifik user
      setDoc(userTxRef, transactionData)
    ]);

    return { 
      success: true, 
      message: `Pembayaran Terdeteksi! Saldo Rp ${expectedAmount.toLocaleString('id-ID')} telah ditambahkan.` 
    };

  } catch (error: any) {
    console.error("TopUp Verify Error:", error);
    return { 
      success: false, 
      message: error.message || "Gagal memproses verifikasi." 
    };
  }
}
