import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import { FloatingEmergencyButton } from "../emergency/FloatingEmergencyButton";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation */}
      <Navigation />
      
      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Main Content */}
      <main className="relative">
        <Outlet />
      </main>
      
      {/* Emergency SOS Button */}
      <FloatingEmergencyButton />
    </div>
  );
};