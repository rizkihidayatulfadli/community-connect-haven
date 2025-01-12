import { SignInForm } from "@/components/auth/SignInForm";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Our Community</h1>
        <SignInForm />
      </div>
    </div>
  );
};

export default Index;