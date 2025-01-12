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
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError | Error) => {
    // Check if it's a Supabase AuthError
    if ('error_type' in error) {
      if (error.message.includes('over_email_send_rate_limit')) {
        return 'Please wait a moment before trying to sign up again.';
      }
    }
    return error.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Create a membership record
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .insert([
          { user_id: authData.user.id }
        ])
        .select()
        .single();

      if (membershipError) throw membershipError;

      // Initialize payment
      const paymentDetails = {
        orderId: `ORDER-${Date.now()}`,
        amount: 25000, // Rp 25.000
        customerName: name,
        customerEmail: email
      };

      // Create payment record
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

      // Create Midtrans payment
      const response = await createPayment(paymentDetails);
      
      // Redirect to Midtrans payment page
      window.location.href = response.redirect_url;
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
          <Button type="submit" className="w-full" disabled={isLoading}>
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