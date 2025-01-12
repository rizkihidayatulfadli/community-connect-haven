import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { PaymentHandler } from "@/services/PaymentHandler";
import { UserRegistration } from "@/services/UserRegistration";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { AuthError } from "@supabase/supabase-js";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitError) return;
    
    setIsLoading(true);
    
    try {
      // Initialize payment
      const paymentDetails = {
        orderId: `ORDER-${Date.now()}`,
        amount: 25000,
        customerName: name,
        customerEmail: email
      };

      // Get payment token
      const token = await PaymentHandler.initializePayment(paymentDetails);
      
      // Process payment
      const paymentResult = await PaymentHandler.handlePayment(token);

      // Create user account and related records
      const user = await UserRegistration.registerUser({ name, email, password });
      const membership = await UserRegistration.createMembership(user.id);
      await UserRegistration.recordPayment(membership.id, {
        ...paymentDetails,
        payment_type: paymentResult.payment_type
      });

      toast({
        title: "Registration successful",
        description: "Your account has been created and payment processed successfully.",
      });
      
      navigate("/member-dashboard");
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