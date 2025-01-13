import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AuthError } from "@supabase/supabase-js";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorMessage = (error: AuthError) => {
    if (error.message.includes('Email not confirmed')) {
      return "Please check your email and confirm your account before signing in.";
    }
    return error.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First attempt to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }

      // Check if user has an active membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('status')
        .eq('user_id', authData.user.id)
        .single();

      if (membershipError) {
        throw new Error('No membership found. Please sign up first.');
      }

      if (membershipData.status !== 'active') {
        // Sign out the user since they don't have an active membership
        await supabase.auth.signOut();
        throw new Error('Your membership is not active. Please complete the payment process.');
      }

      // If we get here, the user is authenticated and has an active membership
      if (email === "owner@example.com") {
        navigate("/owner-dashboard");
      } else {
        navigate("/member-dashboard");
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

    } catch (error) {
      console.error('Sign in error:', error);
      const message = error instanceof AuthError ? getErrorMessage(error) : 'An error occurred during sign in';
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
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
                  placeholder="Enter your password"
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/signup")}
              type="button"
              disabled={isLoading}
            >
              Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}