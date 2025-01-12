import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to Boosthenics</h1>
        <p className="text-muted-foreground">Join our fitness community today</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button 
          onClick={() => navigate("/signin")} 
          className="w-full"
          size="lg"
        >
          Member Login
        </Button>
        <Button 
          onClick={() => navigate("/owner-signin")} 
          variant="outline" 
          className="w-full"
          size="lg"
        >
          Admin Login
        </Button>
      </div>
    </div>
  );
};

export default LandingPage;