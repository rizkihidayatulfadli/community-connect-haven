interface PaymentDetails {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}

export const createPayment = async (details: PaymentDetails) => {
  try {
    const response = await fetch('https://api.midtrans.com/v2/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(import.meta.env.VITE_MIDTRANS_SERVER_KEY + ':'),
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: details.orderId,
          gross_amount: details.amount
        },
        customer_details: {
          first_name: details.customerName,
          email: details.customerEmail
        },
        enabled_payments: ["credit_card", "gopay", "bank_transfer"],
        credit_card: {
          secure: true
        },
        merchant_id: import.meta.env.VITE_MIDTRANS_MERCHANT_ID,
        client_key: import.meta.env.VITE_MIDTRANS_CLIENT_KEY
      })
    });

    if (!response.ok) {
      throw new Error('Payment initialization failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}

// Helper function to check if we're in sandbox mode
export const isSandboxMode = () => {
  return import.meta.env.MODE === 'development';
}

// Get the appropriate API URL based on mode
export const getMidtransApiUrl = () => {
  return isSandboxMode() 
    ? 'https://api.sandbox.midtrans.com/v2'
    : 'https://api.midtrans.com/v2';
}