interface PaymentDetails {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
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

// Get the appropriate client key based on mode
const getClientKey = () => {
  return isSandboxMode()
    ? import.meta.env.VITE_MIDTRANS_SANDBOX_CLIENT_KEY
    : import.meta.env.VITE_MIDTRANS_PRODUCTION_CLIENT_KEY;
}

// Get the appropriate server key based on mode
const getServerKey = () => {
  return isSandboxMode()
    ? import.meta.env.VITE_MIDTRANS_SANDBOX_SERVER_KEY
    : import.meta.env.VITE_MIDTRANS_PRODUCTION_SERVER_KEY;
}

export const createPayment = async (details: PaymentDetails) => {
  try {
    const response = await fetch(getMidtransApiUrl() + '/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(getServerKey() + ':'),
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
        }
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