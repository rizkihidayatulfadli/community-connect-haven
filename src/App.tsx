import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignInForm } from "@/components/auth/SignInForm";
import SignUp from "./pages/SignUp";
import MemberDashboard from "./pages/MemberDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import LandingPage from "./pages/LandingPage";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/member-dashboard" element={<MemberDashboard />} />
        <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
      </Routes>
    </Router>
  );
}

export default App;