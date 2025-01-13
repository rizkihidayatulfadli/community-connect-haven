import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationForm } from "./RegistrationForm";
import { useToast } from "@/components/ui/use-toast";
import { createPayment } from "@/utils/PaymentHandler";

export function UserSignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create membership record
      const { data: membershipData, error: membershipError } = await supabase
        .from("memberships")
        .insert([
          {
            user_id: authData.user?.id,
            status: "pending",
          },
        ])
        .select()
        .single();

      if (membershipError) throw membershipError;

      // Initialize payment
      const paymentResult = await createPayment(membershipData.id);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Payment initialization failed");
      }

      // Redirect to payment page
      if (paymentResult.redirectUrl) {
        window.location.href = paymentResult.redirectUrl;
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegistrationForm
      email={email}
      password={password}
      isLoading={isLoading}
      onEmailChange={(e) => setEmail(e.target.value)}
      onPasswordChange={(e) => setPassword(e.target.value)}
      onSubmit={handleSubmit}
    />
  );
}