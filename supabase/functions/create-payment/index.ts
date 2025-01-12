import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SANDBOX_MODE = Deno.env.get('MODE') === 'development';
const SERVER_KEY = SANDBOX_MODE 
  ? Deno.env.get('MIDTRANS_SANDBOX_SERVER_KEY')
  : Deno.env.get('MIDTRANS_PRODUCTION_SERVER_KEY');
const API_URL = SANDBOX_MODE
  ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
  : 'https://app.midtrans.com/snap/v1/transactions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    console.log('Payment request data:', requestData);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(SERVER_KEY + ':')
      },
      body: JSON.stringify({
        ...requestData,
        enabled_payments: ["credit_card", "gopay", "bank_transfer"]
      })
    });

    const data = await response.json();
    console.log('Midtrans response:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})