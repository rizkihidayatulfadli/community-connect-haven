import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Implement actual signup logic
      
      // Initialize Midtrans payment
      const paymentData = {
        transaction_details: {
          order_id: `ORDER-${Date.now()}`,
          gross_amount: 25000
        },
        customer_details: {
          first_name: name,
          email: email
        }
      };

      // TODO: Replace with your actual Midtrans server endpoint
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const { redirect_url } = await response.json();
      
      // Redirect to Midtrans payment page
      window.location.href = redirect_url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process signup. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-[350px]">
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
          <Button type="submit" className="w-full">Sign Up (Rp 25.000/month)</Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate("/signin")}
            type="button"
          >
            Already have an account?
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}