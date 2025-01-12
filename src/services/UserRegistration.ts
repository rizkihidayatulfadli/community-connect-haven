import { supabase } from "@/integrations/supabase/client";
import { UserRegistrationData } from "@/types/auth";

export class UserRegistration {
  static async registerUser(data: UserRegistrationData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user?.id) throw new Error('User creation failed');

    return authData.user;
  }

  static async createMembership(userId: string) {
    const { data: membershipData, error: membershipError } = await supabase
      .from('memberships')
      .insert([{ user_id: userId, status: 'pending' }])
      .select()
      .single();

    if (membershipError) throw membershipError;
    return membershipData;
  }

  static async recordPayment(membershipId: string, paymentDetails: any) {
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        membership_id: membershipId,
        order_id: paymentDetails.orderId,
        amount: paymentDetails.amount,
        status: 'settlement',
        payment_type: paymentDetails.payment_type,
        transaction_time: new Date().toISOString()
      }]);

    if (paymentError) throw paymentError;
  }
}