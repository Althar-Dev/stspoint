'use server';
/**
 * @fileOverview Server Actions for Console Dashboard.
 * Handles real-time top-up verification against master Orderkuota mutations.
 */

import { initializeFirebase } from '@/firebase';
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
 */
export async function checkTopUpStatusAction(userId: string, expectedAmount: number) {
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

    // 3. Cari transaksi 'IN' yang sesuai dengan nominal unik (presisi 1 rupiah)
    const match = mutationRes.result.find(m => 
      m.status === 'IN' && 
      Math.abs(parseFloat(m.kredit) - expectedAmount) < 1
    );

    if (!match) {
      return { 
        success: false, 
        message: "Pembayaran belum terdeteksi di mutasi kami. Pastikan Anda membayar nominal yang tepat hingga digit terakhir." 
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

    // 5. Eksekusi penambahan saldo dan catat di ledger secara atomik (manual simulasi)
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
