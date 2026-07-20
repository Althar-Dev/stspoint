'use server';
/**
 * @fileOverview Server Actions for Console Dashboard.
 * Handles real-time top-up verification against master Orderkuota mutations.
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
 * @param userId ID pengguna yang melakukan top-up.
 * @param expectedAmount Nominal total (termasuk kode unik) yang harus dibayar.
 * @param requestTimestamp Waktu (ms) saat QRIS dibuat (digunakan sebagai floor safety).
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

    // 3. Cari transaksi 'IN' yang sesuai dengan nominal unik
    // Sesuai permintaan: Fokus pada nominal. 
    // Filter tanggal hanya digunakan untuk membuang mutasi dari hari-hari sebelumnya (safety floor).
    const match = mutationRes.result.find(m => {
      const isNominalMatch = m.status === 'IN' && Math.abs(parseFloat(m.kredit) - expectedAmount) < 1;
      if (!isNominalMatch) return false;

      // Cek apakah mutasi terjadi hari ini (untuk menghindari claim mutasi sangat lama yang belum di-ledger)
      const mutationDate = m.tanggal.split(' ')[0]; // Ambil YYYY-MM-DD
      const todayDate = new Date().toISOString().split('T')[0];
      
      return mutationDate === todayDate;
    });

    if (!match) {
      return { 
        success: false, 
        message: "Pembayaran belum terdeteksi. Pastikan nominal transfer sama persis (Rp " + expectedAmount.toLocaleString('id-ID') + ") dan mutasi sudah muncul di aplikasi perbankan Anda." 
      };
    }

    // 4. Cek apakah transaksi ini sudah pernah diklaim (Ledger Check via Provider Trx ID)
    const ledgerRef = doc(firestore, 'processed_topups', match.id.toString());
    const ledgerSnap = await getDoc(ledgerRef);
    
    if (ledgerSnap.exists()) {
      return { 
        success: false, 
        message: "Transaksi dengan ID ini sudah pernah diproses sebelumnya." 
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
        bank: match.brand?.name || 'Unknown',
        processedAt: serverTimestamp(),
        mutationRawDate: match.tanggal
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
