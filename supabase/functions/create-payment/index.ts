import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SANDBOX_MODE = Deno.env.get('MODE') === 'development';
const SERVER_KEY = SANDBOX_MODE 
  ? Deno.env.get('MIDTRANS_SANDBOX_SERVER_KEY')
  : Deno.env.get('MIDTRANS_PRODUCTION_SERVER_KEY');
const API_URL = SANDBOX_MODE
  ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
  : 'https://app.midtrans.com/snap/v1/transactions';

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestData = await req.json();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(SERVER_KEY + ':')
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})