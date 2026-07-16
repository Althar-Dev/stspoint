
'use server';
/**
 * @fileOverview Bridge Service untuk mengenerate data pembayaran asli dari Xendit (v3) atau Midtrans (Core API).
 */

import { createXenditPaymentRequest, type PaymentMethodType } from "@/lib/xendit/payment-request";
import { chargeMidtrans } from "@/lib/midtrans/core-api";

export async function requestPaymentInfo(type: 'qris' | 'va' | 'ewallet' | 'retail' | 'paylater', data: any) {
  const provider = data.provider || 'Xendit';

  if (provider === 'Midtrans') {
    return handleMidtransPayment(type, data);
  }

  return handleXenditPayment(type, data);
}

/**
 * LOGIKA XENDIT (V3)
 */
async function handleXenditPayment(type: string, data: any) {
  try {
    const bankCode = (data.bank_code || '').toUpperCase();
    
    // Perbaikan Kritis: Jika Akulaku, gunakan tipe PAYLATER dan payload paylater yang sesuai
    const isAkulaku = bankCode === 'AKULAKU';
    const methodType: PaymentMethodType = 
      type === 'qris' ? 'QR_CODE' : 
      type === 'va' ? 'VIRTUAL_ACCOUNT' : 
      type === 'retail' ? 'OVER_THE_COUNTER' : 
      isAkulaku ? 'PAYLATER' : 'EWALLET';

    const payload: any = {
      reference_id: data.external_id,
      amount: data.amount,
      currency: 'IDR',
      country: 'ID',
      description: `Payment for STSPay Transaction ${data.external_id}`,
      payment_method: {
        type: methodType,
        reusability: 'ONE_TIME_USE',
      }
    };

    if (type === 'va') {
      payload.payment_method.virtual_account = {
        channel_code: bankCode,
        channel_properties: {
          customer_name: data.name || 'STS Customer'
        }
      };
    } else if (type === 'qris') {
      payload.payment_method.qr_code = {
        channel_code: 'QRIS',
        channel_properties: {}
      };
    } else if (isAkulaku) {
       payload.payment_method.paylater = {
         channel_code: 'AKULAKU'
       };
    } else if (type === 'ewallet') {
      payload.payment_method.ewallet = {
        channel_code: bankCode,
        channel_properties: {
          success_return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/checkout/${data.external_id}`
        }
      };
      
      if (bankCode.includes('OVO') && data.mobile_number) {
        const formattedMobile = data.mobile_number.startsWith('+') 
          ? data.mobile_number 
          : `+62${data.mobile_number.replace(/^0/, '')}`;
        payload.payment_method.ewallet.channel_properties.mobile_number = formattedMobile;
      }
    } else if (type === 'retail') {
      payload.payment_method.over_the_counter = {
        channel_code: bankCode,
        channel_properties: {
          customer_name: data.name || 'STS Customer'
        }
      };
    }

    const res = await createXenditPaymentRequest(payload);

    if (res.success && res.data) {
      const pr = res.data;
      const pm = pr.payment_method;

      if (type === 'qris') {
        return { 
          success: true, 
          qr_string: pm.qr_code.channel_properties.qr_string,
          qr_id: pm.qr_code.id,
          pr_id: pr.id,
          provider: 'Xendit',
          raw_response: pr
        };
      } else if (type === 'va') {
        return { 
          success: true, 
          account_number: pm.virtual_account.channel_properties.virtual_account_number,
          bank_code: pm.virtual_account.channel_code,
          va_id: pm.virtual_account.id,
          pr_id: pr.id,
          provider: 'Xendit',
          raw_response: pr
        };
      } else if (type === 'ewallet' || isAkulaku) {
        const checkoutAction = pr.actions?.find((a: any) => a.action === 'MOBILE_DEEPLINK' || a.action === 'WEB_CHECKOUT');
        return {
          success: true,
          checkout_url: checkoutAction?.url || null,
          channel_code: (pm.ewallet?.channel_code || pm.paylater?.channel_code),
          is_push_payment: pm.ewallet?.channel_code?.includes('OVO'),
          pr_id: pr.id,
          provider: 'Xendit',
          raw_response: pr
        };
      } else if (type === 'retail') {
        return {
          success: true,
          payment_code: pm.over_the_counter.channel_properties.payment_code,
          bank_code: pm.over_the_counter.channel_code,
          fpc_id: pm.over_the_counter.id,
          pr_id: pr.id,
          provider: 'Xendit',
          raw_response: pr
        };
      }
    }
    throw new Error(res.message || 'Gagal mendapatkan respon valid dari Xendit.');
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

/**
 * LOGIKA MIDTRANS (CORE API)
 */
async function handleMidtransPayment(type: string, data: any) {
  try {
    const bankCode = (data.bank_code || '').toUpperCase();
    const amount = Math.round(data.amount);
    const finishUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/checkout/${data.external_id}`;

    let midtransPayload: any = {
      transaction_details: {
        order_id: data.external_id,
        gross_amount: amount,
      },
      customer_details: {
        first_name: data.name || 'STS Customer',
        email: data.payer_email || 'customer@stspoint.com',
        phone: data.mobile_number || ''
      }
    };

    if (type === 'va') {
      if (bankCode === 'MANDIRI') {
        midtransPayload.payment_type = 'echannel';
        midtransPayload.echannel = {
          bill_info1: "Payment:",
          bill_info2: "Digital Product"
        };
      } else if (bankCode === 'PERMATA') {
        midtransPayload.payment_type = 'permata';
      } else {
        midtransPayload.payment_type = 'bank_transfer';
        midtransPayload.bank_transfer = { 
          bank: bankCode.toLowerCase() 
        };
      }
    } else if (type === 'qris') {
      midtransPayload.payment_type = 'qris';
    } else if (type === 'ewallet' || type === 'paylater') {
       if (bankCode.includes('GOPAY')) {
          midtransPayload.payment_type = 'gopay';
          midtransPayload.gopay = {
             enable_callback: true,
             callback_url: finishUrl
          };
       } else if (bankCode.includes('SHOPEEPAY')) {
          midtransPayload.payment_type = 'shopeepay';
          midtransPayload.shopeepay = {
             callback_url: finishUrl
          };
       } else if (type === 'paylater') {
          midtransPayload.payment_type = bankCode.toLowerCase();
       } else {
          midtransPayload.payment_type = 'qris';
       }
    } else if (type === 'retail') {
      midtransPayload.payment_type = 'cstore';
      midtransPayload.cstore = {
        store: bankCode === 'INDOMARET' ? 'indomaret' : 'alfamart',
        message: `Payment for ${data.external_id}`
      };
    }

    const res = await chargeMidtrans(midtransPayload);
    
    if (res.success && res.data) {
       const d = res.data;
       
       if (type === 'va') {
          const accountNumber = d.va_numbers?.[0]?.va_number || d.permata_va_number || d.bill_key;
          const bankLabel = d.va_numbers?.[0]?.bank?.toUpperCase() || bankCode;
          return {
             success: true,
             account_number: accountNumber,
             bank_code: bankLabel,
             payment_code: d.biller_code,
             pr_id: d.order_id || data.external_id,
             provider: 'Midtrans',
             raw_response: d
          };
       } else {
          const payAction = d.actions?.find((a: any) => 
            a.name === 'deeplink-redirect' || 
            a.name === 'mobile-deeplink' || 
            a.name === 'shopeepay-deeplink'
          );
          
          const qrAction = d.actions?.find((a: any) => a.name === 'generate-qr-code' || a.name === 'generate-qr-code-v2');
          
          const checkoutUrl = payAction?.url || d.redirect_url || null;
          const isDeeplinkMethod = type === 'ewallet' || type === 'paylater' || bankCode.includes('GOPAY') || bankCode.includes('SHOPEEPAY');

          return {
             success: true,
             qr_string: (isDeeplinkMethod && checkoutUrl) ? null : (qrAction?.url || null),
             checkout_url: checkoutUrl,
             payment_code: d.payment_code || d.bill_key || null,
             bank_code: bankCode,
             pr_id: d.order_id || data.external_id,
             provider: 'Midtrans',
             raw_response: d
          };
       }
    }
    throw new Error(res.message || "Gagal mendapatkan respon valid dari Midtrans.");
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
