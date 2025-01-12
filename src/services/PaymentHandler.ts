import { createPayment } from "@/services/midtrans";
import { PaymentDetails } from "@/types/payment";

export class PaymentHandler {
  static async initializePayment(details: PaymentDetails, customCallbacks?: {
    finish?: string;
    error?: string;
    pending?: string;
  }) {
    const response = await createPayment(details, customCallbacks);
    if (!response.token) {
      throw new Error('Failed to get payment token');
    }
    return response.token;
  }

  static handlePayment(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // @ts-ignore - Midtrans types are not available
      window.snap.pay(token, {
        onSuccess: (result: any) => resolve(result),
        onPending: (result: any) => reject(new Error('Payment pending')),
        onError: (result: any) => reject(new Error('Payment failed')),
        onClose: () => reject(new Error('Payment window closed'))
      });
    });
  }
}