interface PaymentDetails {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
}

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

const getServerKey = () => {
  return isSandboxMode()
    ? import.meta.env.VITE_MIDTRANS_SANDBOX_SERVER_KEY
    : import.meta.env.VITE_MIDTRANS_PRODUCTION_SERVER_KEY;
}

export const createPayment = async (details: PaymentDetails) => {
  try {
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    return {
      token: data.token,
      redirect_url: data.redirect_url
    };
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
}