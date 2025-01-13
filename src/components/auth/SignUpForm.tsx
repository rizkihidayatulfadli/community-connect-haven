import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isAdmin = email.endsWith('@boosthenics.com');

      if (isAdmin) {
        // Admin registration flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'admin'
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account.",
        });

        navigate("/owner-signin");
      } else {
        // Regular user registration flow
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'member'
            }
          }
        });

        if (userError) throw userError;

        // Create membership record
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .insert([{ 
            user_id: userData.user?.id,
            status: 'pending'
          }])
          .select()
          .single();

        if (membershipError) throw membershipError;

        // Generate order ID
        const orderId = `ORDER-${Date.now()}`;

        // Record initial payment attempt
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            membership_id: membershipData.id,
            order_id: orderId,
            amount: 100000, // Amount in smallest currency unit (e.g., cents)
            status: 'pending'
          }]);

        if (paymentError) throw paymentError;

        // Call create-payment edge function to get Midtrans token
        const { data: paymentData, error: tokenError } = await supabase.functions.invoke('create-payment', {
          body: {
            transaction_details: {
              order_id: orderId,
              gross_amount: 100000
            },
            customer_details: {
              first_name: name,
              email: email
            }
          }
        });

        if (tokenError) throw tokenError;

        // Open Midtrans popup with the token
        if (window.snap && paymentData.token) {
          window.snap.pay(paymentData.token, {
            onSuccess: async (result: any) => {
              console.log('Payment success:', result);
              navigate('/member-dashboard');
            },
            onPending: (result: any) => {
              console.log('Payment pending:', result);
              toast({
                title: "Payment Pending",
                description: "Please complete your payment",
              });
            },
            onError: (result: any) => {
              console.error('Payment error:', result);
              toast({
                title: "Payment Failed",
                description: "Please try again",
                variant: "destructive"
              });
            },
            onClose: () => {
              console.log('Customer closed the popup without finishing the payment');
              toast({
                title: "Payment Cancelled",
                description: "You can try again later",
              });
            }
          });
        } else {
          throw new Error('Payment system not initialized');
        }

        toast({
          title: "Registration initiated",
          description: "Please complete the payment process.",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
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
                placeholder="Choose a password"
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
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
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