import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { FloatingEmergencyButton } from "../emergency/FloatingEmergencyButton";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="relative pt-16"> {/* Add padding-top to account for fixed navbar */}
        <Outlet />
      </main>
      
      {/* Emergency SOS Button */}
      <FloatingEmergencyButton />
    </div>
  );
};