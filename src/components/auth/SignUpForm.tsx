import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { createPayment } from "@/services/midtrans";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError | Error) => {
    if ('error_type' in error) {
      if (error.message.includes('over_email_send_rate_limit')) {
        setRateLimitError(true);
        setTimeout(() => setRateLimitError(false), 60000); // Reset after 60 seconds
        return 'Please wait a moment before trying to sign up again.';
      }
    }
    return error.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitError) return;
    
    setIsLoading(true);
    
    try {
      // First create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user?.id) {
        throw new Error('User creation failed');
      }

      // Create a membership record with explicit user_id
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .insert([
          { 
            user_id: authData.user.id,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (membershipError) throw membershipError;

      // Initialize payment
      const paymentDetails = {
        orderId: `ORDER-${Date.now()}`,
        amount: 25000,
        customerName: name,
        customerEmail: email
      };

      // Create payment record with explicit membership_id
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            membership_id: membershipData.id,
            order_id: paymentDetails.orderId,
            amount: paymentDetails.amount,
            status: 'pending'
          }
        ]);

      if (paymentError) throw paymentError;

      // Create Midtrans payment and get the snap token
      const response = await createPayment(paymentDetails);
      
      // Open Midtrans Snap popup
      if (response.token) {
        // @ts-ignore - Midtrans types are not available
        window.snap.pay(response.token, {
          onSuccess: function(result: any) {
            toast({
              title: "Payment successful",
              description: "Your payment has been processed successfully.",
            });
            navigate("/");
          },
          onPending: function(result: any) {
            toast({
              title: "Payment pending",
              description: "Please complete your payment.",
            });
          },
          onError: function(result: any) {
            toast({
              title: "Payment failed",
              description: "There was an error processing your payment.",
              variant: "destructive"
            });
          },
          onClose: function() {
            setIsLoading(false);
          }
        });
      } else {
        throw new Error('Failed to get payment token');
      }
    } catch (error) {
      const message = getErrorMessage(error as AuthError | Error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join Boosthenics community</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || rateLimitError}
          >
            {isLoading ? "Processing..." : "Sign Up (Rp 25.000/month)"}
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/signin")}
            type="button"
            disabled={isLoading}
          >
            Already have an account?
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}