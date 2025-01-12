import { SignUpForm } from "@/components/auth/SignUpForm";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSandboxMode } from "@/services/midtrans";

const SignUp = () => {
  const location = useLocation();

  useEffect(() => {
    // Load Midtrans script
    const script = document.createElement('script');
    script.src = isSandboxMode()
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', isSandboxMode()
      ? import.meta.env.VITE_MIDTRANS_SANDBOX_CLIENT_KEY
      : import.meta.env.VITE_MIDTRANS_PRODUCTION_CLIENT_KEY);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Handle Midtrans payment callback
    const params = new URLSearchParams(location.search);
    const transactionStatus = params.get("transaction_status");
    if (transactionStatus) {
      console.log("Payment status:", transactionStatus);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUpForm />
    </div>
  );
};

export default SignUp;