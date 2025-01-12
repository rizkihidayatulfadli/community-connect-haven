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
    if ('error_type' in error) {
      if (error.message.includes('over_email_send_rate_limit')) {
        setRateLimitError(true);
        setTimeout(() => setRateLimitError(false), 60000);
        return 'Please wait a moment before trying to sign up again.';
      }
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