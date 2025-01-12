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
      if (!window.snap) {
        reject(new Error('Midtrans Snap is not initialized'));
        return;
      }

      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('Payment success:', result);
          resolve(result);
        },
        onPending: (result: any) => {
          console.log('Payment pending:', result);
          resolve(result); // We resolve here too since we want to create the user account
        },
        onError: (result: any) => {
          console.error('Payment error:', result);
          reject(new Error('Payment failed'));
        },
        onClose: () => {
          console.log('Payment dialog closed');
          reject(new Error('Payment window closed'));
        }
      });
    });
  }
}