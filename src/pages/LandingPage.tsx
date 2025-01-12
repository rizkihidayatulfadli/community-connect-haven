import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 md:p-8">
      <div className="text-center mb-8 w-full max-w-md px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Welcome to Boosthenics</h1>
        <p className="text-muted-foreground text-sm md:text-base">Join our fitness community today</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-sm px-4">
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