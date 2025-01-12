import { SignUpForm } from "@/components/auth/SignUpForm";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSandboxMode } from "@/services/midtrans";

declare global {
  interface Window {
    snap: any;
  }
}

const SignUp = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove any existing Midtrans script to prevent duplicates
    const existingScript = document.getElementById('midtrans-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Load Midtrans script
    const script = document.createElement('script');
    script.id = 'midtrans-script';
    script.src = isSandboxMode()
      ? 'https://app.sandbox.midtrans.com/snap/snap.js'
      : 'https://app.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', isSandboxMode()
      ? import.meta.env.VITE_MIDTRANS_SANDBOX_CLIENT_KEY
      : import.meta.env.VITE_MIDTRANS_PRODUCTION_CLIENT_KEY);
    
    // Wait for script to load before allowing form submission
    script.onload = () => {
      console.log('Midtrans Snap script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap script');
    };
    
    document.body.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      const script = document.getElementById('midtrans-script');
      if (script) {
        script.remove();
      }
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