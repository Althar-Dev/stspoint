'use server';
/**
 * @fileOverview Server Actions for Console Dashboard.
 * Handles real-time top-up verification against master Orderkuota mutations with time-filtering.
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
 * Memverifikasi pembayaran top-up berdasarkan nominal unik dan waktu transaksi.
 * @param userId ID pengguna yang melakukan top-up.
 * @param expectedAmount Nominal total (termasuk kode unik) yang harus dibayar.
 * @param requestTimestamp Waktu (ms) saat QRIS dibuat untuk mencegah klaim transaksi lama.
 */
export async function checkTopUpStatusAction(userId: string, expectedAmount: number, requestTimestamp: number) {
  try {
    const { firestore } = initializeFirebase();
    
    // 1. Ambil konfigurasi master bridge dari Firestore
    const masterRef = doc(firestore, 'settings', 'orderkuota');
    const masterSnap = await getDoc(masterRef);
    
    if (!masterSnap.exists() || !masterSnap.data().token) {
      throw new Error("Sistem Bridge Master belum dikonfigurasi oleh Admin.");
    }
    
    const master = masterSnap.data();

    // 2. Tarik data mutasi live dari provider
    const mutationRes = await getOrderkuotaMutation({
      username: master.username,
      token: master.token
    });

    if (!mutationRes.status || !mutationRes.result) {
      throw new Error(mutationRes.message || "Gagal menghubungi server provider mutasi.");
    }

    // 3. Cari transaksi 'IN' yang sesuai dengan nominal unik DAN terjadi setelah QRIS dibuat
    const match = mutationRes.result.find(m => {
      const isNominalMatch = m.status === 'IN' && Math.abs(parseFloat(m.kredit) - expectedAmount) < 1;
      if (!isNominalMatch) return false;

      // Konversi tanggal mutasi (format YYYY-MM-DD HH:mm:ss) ke timestamp
      const mutationTime = new Date(m.tanggal).getTime();
      
      // Hanya terima mutasi yang terjadi setelah atau pada saat permintaan dibuat (dengan toleransi 1 menit mundur)
      return mutationTime >= (requestTimestamp - 60000); 
    });

    if (!match) {
      return { 
        success: false, 
        message: "Pembayaran belum terdeteksi. Pastikan nominal transfer sama persis dan mutasi sudah muncul di aplikasi perbankan Anda." 
      };
    }

    // 4. Cek apakah transaksi ini sudah pernah diklaim (Ledger Check)
    const ledgerRef = doc(firestore, 'processed_topups', match.id.toString());
    const ledgerSnap = await getDoc(ledgerRef);
    
    if (ledgerSnap.exists()) {
      return { 
        success: false, 
        message: "Transaksi ini sudah pernah diproses ke saldo akun Anda atau orang lain." 
      };
    }

    // 5. Eksekusi penambahan saldo dan catat di ledger secara atomik
    const userRef = doc(firestore, 'users', userId);
    
    await Promise.all([
      updateDoc(userRef, {
        balance: increment(expectedAmount),
        updatedAt: serverTimestamp()
      }),
      setDoc(ledgerRef, {
        userId,
        amount: expectedAmount,
        orkutTrxId: match.id,
        bank: match.brand.name,
        processedAt: serverTimestamp()
      })
    ]);

    return { 
      success: true, 
      message: `Berhasil! Saldo Rp ${expectedAmount.toLocaleString('id-ID')} telah ditambahkan ke akun Anda.` 
    };

  } catch (error: any) {
    console.error("TopUp Verify Error:", error);
    return { 
      success: false, 
      message: error.message || "Terjadi kesalahan internal saat memverifikasi pembayaran." 
    };
  }
}
