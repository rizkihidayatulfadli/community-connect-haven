import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SignUpForm() {
  const navigate = useNavigate();
  const {
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
  } = useSignUpForm();

  // Check authentication state on mount and changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user);
        const isAdmin = session.user.email?.endsWith('@boosthenics.com');
        navigate(isAdmin ? '/admin-dashboard' : '/member-dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const isAdminEmail = (email: string) => {
    return email.endsWith('@boosthenics.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitError) return;
    
    setIsLoading(true);
    
    try {
      console.log('Starting registration process...');
      
      if (isAdminEmail(email)) {
        // Admin registration flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password: 'temporary-password', // Temporary password that will be changed after email verification
          options: {
            data: {
              full_name: name,
              role: 'admin'
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Admin Registration Successful",
          description: "Please check your email to verify your account and set your password.",
        });

        navigate("/signin");
      } else {
        // Regular user registration flow
        console.log('Starting user registration flow...');
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              role: 'member'
            }
          }
        });

        if (error) throw error;

        // Initialize payment with proper details
        const paymentDetails = {
          orderId: `ORDER-${Date.now()}`,
          amount: 25000, // Amount in IDR (Rp 25.000)
          customerName: name,
          customerEmail: email
        };

        // Set up callback URLs using the current domain
        const customCallbacks = {
          finish: `${window.location.origin}/member-dashboard`,
          error: `${window.location.origin}/signup?error=true`,
          pending: `${window.location.origin}/signup?pending=true`
        };
        
        console.log('Initializing payment with details:', paymentDetails);
        
        // Create membership record
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .insert([{ 
            user_id: data.user?.id,
            status: 'pending'
          }])
          .select()
          .single();

        if (membershipError) throw membershipError;

        // Record initial payment attempt
        const { error: paymentError } = await supabase
          .from('payments')
          .insert([{
            membership_id: membershipData.id,
            order_id: paymentDetails.orderId,
            amount: paymentDetails.amount,
            status: 'pending'
          }]);

        if (paymentError) throw paymentError;

        // Open Midtrans popup
        window.snap.pay(paymentDetails.orderId, {
          onSuccess: async (result: any) => {
            console.log('Payment success:', result);
            navigate('/member-dashboard');
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            navigate('/signup?pending=true');
          },
          onError: (result: any) => {
            console.error('Payment error:', result);
            navigate('/signup?error=true');
          },
          onClose: () => {
            console.log('Customer closed the popup without finishing the payment');
          }
        });

        toast({
          title: "Registration successful",
          description: "Please complete the payment process.",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = getErrorMessage(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
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
            {!isAdminEmail(email) && (
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
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || rateLimitError}
          >
            {isLoading ? "Processing..." : isAdminEmail(email) ? "Sign Up as Admin" : "Sign Up (Rp 25.000/month)"}
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