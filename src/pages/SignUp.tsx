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
    const loadMidtransScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Remove any existing Midtrans script
        const existingScript = document.getElementById('midtrans-script');
        if (existingScript) {
          existingScript.remove();
        }

        // Create new script element
        const script = document.createElement('script');
        script.id = 'midtrans-script';
        script.src = isSandboxMode()
          ? 'https://app.sandbox.midtrans.com/snap/snap.js'
          : 'https://app.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', isSandboxMode()
          ? import.meta.env.VITE_MIDTRANS_SANDBOX_CLIENT_KEY
          : import.meta.env.VITE_MIDTRANS_PRODUCTION_CLIENT_KEY);
        
        script.onload = () => {
          console.log('Midtrans Snap script loaded successfully');
          resolve();
        };
        
        script.onerror = () => {
          console.error('Failed to load Midtrans Snap script');
          reject(new Error('Failed to load payment system'));
        };
        
        document.body.appendChild(script);
      });
    };

    loadMidtransScript().catch(console.error);

    return () => {
      const script = document.getElementById('midtrans-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transactionStatus = params.get("transaction_status");
    if (transactionStatus) {
      console.log("Payment status from URL:", transactionStatus);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUpForm />
    </div>
  );
};

export default SignUp;