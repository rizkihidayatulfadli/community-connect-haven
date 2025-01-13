import { supabase } from "@/integrations/supabase/client";

interface CreatePaymentResponse {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export async function createPayment(membershipId: string): Promise<CreatePaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: { membershipId },
    });

    if (error) throw error;

    if (data?.redirect_url) {
      return {
        success: true,
        redirectUrl: data.redirect_url,
      };
    }

    throw new Error('No redirect URL received');
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}