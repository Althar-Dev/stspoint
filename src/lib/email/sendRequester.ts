
'use server';

import nodemailer from 'nodemailer';

/**
 * @fileOverview Email Dispatcher for System Requesters.
 * Menangani pengiriman notifikasi untuk penarikan saldo dan verifikasi rekening bank.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const TARGET_EMAIL = 'alhadiadriano.id@gmail.com';

/**
 * Mengirim email notifikasi penarikan saldo (Withdrawal).
 */
export async function sendWithdrawRequestEmail(data: {
  userName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  txId: string;
}) {
  const mailOptions = {
    from: `"STSPoint System" <${process.env.SMTP_USER}>`,
    to: TARGET_EMAIL,
    subject: `🚨 Withdraw Request: Rp ${data.amount.toLocaleString('id-ID')} - ${data.userName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fff;">
        <h2 style="color: #10b981; margin-bottom: 20px;">Permintaan Penarikan Baru</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 150px;">Merchant:</td><td style="padding: 8px 0; font-weight: bold;">${data.userName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; font-weight: bold;">${data.userEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Nominal:</td><td style="padding: 8px 0; font-weight: bold; color: #10b981; font-size: 1.2em;">Rp ${data.amount.toLocaleString('id-ID')}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Bank:</td><td style="padding: 8px 0; font-weight: bold;">${data.bankName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">No. Rekening:</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.accountNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Atas Nama:</td><td style="padding: 8px 0; font-weight: bold;">${data.accountName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Transaction ID:</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.txId}</td></tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Harap segera proses melalui Root Console STSPoint.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Nodemailer Error (Withdraw):", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mengirim email notifikasi verifikasi rekening bank.
 */
export async function sendBankVerificationRequestEmail(data: {
  userName: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}) {
  const mailOptions = {
    from: `"STSPoint System" <${process.env.SMTP_USER}>`,
    to: TARGET_EMAIL,
    subject: `🏦 Verifikasi Rekening: ${data.userName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #fff;">
        <h2 style="color: #3b82f6; margin-bottom: 20px;">Permintaan Verifikasi Rekening</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 150px;">Merchant:</td><td style="padding: 8px 0; font-weight: bold;">${data.userName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; font-weight: bold;">${data.userEmail}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Bank:</td><td style="padding: 8px 0; font-weight: bold;">${data.bankName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">No. Rekening:</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${data.accountNumber}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Atas Nama:</td><td style="padding: 8px 0; font-weight: bold;">${data.accountName}</td></tr>
        </table>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">Harap lakukan audit dan konfirmasi melalui Root Console STSPoint.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Nodemailer Error (Verification):", error);
    return { success: false, error: error.message };
  }
}
