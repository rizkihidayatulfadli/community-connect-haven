import { MemberList } from "@/components/dashboard/MemberList";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const OwnerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">Owner Dashboard</h1>
          <Button variant="outline" onClick={() => navigate("/")}>Sign Out</Button>
        </div>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Total Members</h3>
              <p className="text-2xl">3</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Active Members</h3>
              <p className="text-2xl">2</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Pending Members</h3>
              <p className="text-2xl">1</p>
            </div>
          </div>
          <MemberList />
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;