import { createPayment } from "@/services/midtrans";
import { PaymentDetails } from "@/types/payment";

export class PaymentHandler {
  static async initializePayment(details: PaymentDetails, customCallbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  }) {
    try {
      console.log('Initializing payment with details:', details);
      const response = await createPayment(details, customCallbacks);
      console.log('Payment initialization response:', response);
      
      if (!response.token) {
        throw new Error('Failed to get payment token');
      }
      return response.token;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  static handlePayment(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window.snap === 'undefined') {
        console.error('Midtrans Snap is not initialized');
        reject(new Error('Payment system is not ready. Please try again.'));
        return;
      }

      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          resolve({
            ...result,
            payment_type: result.payment_type,
            status: 'settlement'
          });
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
          resolve({
            ...result,
            payment_type: result.payment_type,
            status: 'pending'
          });
        },
        onError: (result: any) => {
          console.error('Payment error:', result);
          reject(new Error(result.message || 'Payment failed'));
        },
        onClose: () => {
          console.log('Customer closed the popup without finishing the payment');
          reject(new Error('Payment cancelled'));
        },
        language: "en"
      });
    });
  }
}