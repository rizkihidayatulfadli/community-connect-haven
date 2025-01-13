import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSignUpForm } from "./UserSignUpForm";

export function SignUpForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your email and password below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserSignUpForm />
      </CardContent>
    </Card>
  );
}