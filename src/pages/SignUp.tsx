import { SignUpForm } from "@/components/auth/SignUpForm";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SignUp = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle Midtrans payment callback
    const params = new URLSearchParams(location.search);
    const transactionStatus = params.get("transaction_status");
    if (transactionStatus) {
      // Handle payment status
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