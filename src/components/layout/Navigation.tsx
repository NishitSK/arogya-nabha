import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Calendar, 
  User, 
  Stethoscope, 
  UserCheck, 
  Settings,
  Menu,
  X,
  Home,
  Map,
  Book,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/", 
      label: "होम", // Home in Hindi
      labelEn: "Home",
      icon: Home 
    },
    { 
      path: "/patient", 
      label: "मरीज़", // Patient in Hindi
      labelEn: "Patient",
      icon: User 
    },
    { 
      path: "/doctor", 
      label: "डॉक्टर", // Doctor in Hindi
      labelEn: "Doctor",
      icon: Stethoscope 
    },
    { 
      path: "/nurse", 
      label: "नर्स", // Nurse in Hindi
      labelEn: "Nurse",
      icon: UserCheck 
    },
    { 
      path: "/hospitals", 
      label: "अस्पताल", // Hospital in Hindi
      labelEn: "Hospitals",
      icon: Map 
    },
    { 
      path: "/health-info", 
      label: "स्वास्थ्य जानकारी", // Health Info in Hindi
      labelEn: "Health Info",
      icon: Book 
    },
    { 
      path: "/emergency", 
      label: "आपातकाल", // Emergency in Hindi
      labelEn: "Emergency",
      icon: Phone 
    }
  ];

  return (
    <nav className="glass-nav sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              Arogya Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2 transition-all duration-300 focus-ring",
                    isActive(item.path) 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.labelEn}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden focus-ring"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-white/10 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start space-x-3 py-3 focus-ring",
                      isActive(item.path) 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.labelEn}</span>
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};