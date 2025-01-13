import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "@supabase/supabase-js";

export const useSignUpForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError | Error) => {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('over_email_send_rate_limit')) {
      setRateLimitError(true);
      // Reset rate limit error after 10 seconds (as per error message)
      setTimeout(() => setRateLimitError(false), 10000);
      return 'Please wait 10 seconds before trying to sign up again.';
    }
    
    if (errorMessage.includes('email not confirmed')) {
      return 'Please check your email and confirm your account before signing in.';
    }
    
    return error.message;
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    setIsLoading,
    rateLimitError,
    getErrorMessage,
    toast
  };
};