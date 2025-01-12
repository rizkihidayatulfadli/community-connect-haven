import { supabase } from "@/integrations/supabase/client";
import { PaymentDetails } from "@/types/payment";

export const isSandboxMode = () => {
  return import.meta.env.MODE === 'development';
}

export const getMidtransApiUrl = () => {
  return isSandboxMode() 
    ? 'https://app.sandbox.midtrans.com/snap/v1'
    : 'https://app.midtrans.com/snap/v1';
}

const getClientKey = () => {
  return isSandboxMode()
    ? import.meta.env.VITE_MIDTRANS_SANDBOX_CLIENT_KEY
    : import.meta.env.VITE_MIDTRANS_PRODUCTION_CLIENT_KEY;
}

export const createPayment = async (details: PaymentDetails, customCallbacks?: {
  finish?: string;
  error?: string;
  pending?: string;
}) => {
  try {
    console.log('Creating payment with details:', details);
    
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: {
        transaction_details: {
          order_id: details.orderId,
          gross_amount: details.amount
        },
        customer_details: {
          first_name: details.customerName,
          email: details.customerEmail
        },
        credit_card: {
          secure: true
        },
        callbacks: {
          finish: customCallbacks?.finish || window.location.origin + '/member-dashboard',
          error: customCallbacks?.error || window.location.origin + '/signup?error=true',
          pending: customCallbacks?.pending || window.location.origin + '/signup?pending=true'
        }
      }
    });

    if (error) {
      console.error('Payment creation error:', error);
      throw error;
    }

    console.log('Payment creation response:', data);
    return data;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}