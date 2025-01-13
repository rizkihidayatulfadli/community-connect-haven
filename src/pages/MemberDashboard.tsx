import { MemberList } from "@/components/dashboard/MemberList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserCircle, LogOut, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Member Dashboard</h1>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile-settings")}
              className="flex items-center gap-2"
            >
              <UserCircle className="h-4 w-4" />
              {!isMobile && "Profile Settings"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {!isMobile && "Sign Out"}
            </Button>
          </div>
        </div>
        <MemberList />
      </div>
    </div>
  );
};

export default MemberDashboard;