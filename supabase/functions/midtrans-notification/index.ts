import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const notification = await req.json()
    console.log('Received Midtrans notification:', notification)

    const { order_id, transaction_status, payment_type, transaction_time } = notification

    // Update payment status in database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .update({
        status: transaction_status,
        payment_type: payment_type,
        transaction_time: transaction_time
      })
      .eq('order_id', order_id)
      .select()
      .single()

    if (paymentError) {
      console.error('Error updating payment:', paymentError)
      throw paymentError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error processing notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})