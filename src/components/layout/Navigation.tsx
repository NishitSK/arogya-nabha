import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Phone,
  Users,
  AlertOctagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import ProfileDropdown from '../ProfileDropdown';
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { motion } from "framer-motion";


export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUsername(null);
      setRole(null);
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.username || payload.name || null);
      setRole(payload.role || null);
    } catch {
      setUsername(null);
      setRole(null);
    }
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: "/", 
      label: "होम", // Home in Hindi
      labelEn: "Home",
      icon: Home 
    },
    ...(role === 'doctor' ? [
      { 
        path: "/doctor", 
        label: "डॉक्टर", // Doctor in Hindi
        labelEn: "Doctor",
        icon: Stethoscope 
      }
    ] : role === 'patient' ? [
      { 
        path: "/patient", 
        label: "मरीज़", // Patient in Hindi
        labelEn: "Patient",
        icon: User 
      }
    ] : []),
    { 
      path: "/hospitals", 
      label: "अस्पताल", // Hospital in Hindi
      labelEn: "Hospitals",
      icon: Map 
    },
    { 
      path: "/volunteer", 
      label: "स्वयंसेवक", // Volunteer in Hindi
      labelEn: "Volunteer",
      icon: Users 
    }
  ];

  // Handle emergency navigation and SOS
  const handleEmergencyClick = () => {
    if (!isEmergency) {
      setIsEmergency(true);
      // Show SOS options in a dialog
      if (window.confirm(t('emergency.confirmSOS'))) {
        // Call emergency number directly if confirmed
        window.location.href = 'tel:102';
      } else {
        // Navigate to emergency page if not immediate emergency
        navigate("/emergency");
      }
      // Reset emergency state after 5 seconds
      setTimeout(() => setIsEmergency(false), 5000);
    } else {
      navigate("/emergency");
    }
  };

  // Pulse animation for emergency state
  const pulseAnimation = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
    },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Animation variants
  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Heart className="h-8 w-8 text-primary" />
            </motion.div>
            <span className="text-xl font-semibold text-foreground">
              Arogya Connect
            </span>
          </Link>
        </motion.div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <motion.div key={item.path} variants={itemVariants} custom={index}>
              <Link to={item.path}>
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
                  <span className="text-sm">{t(`nav.${item.path === '/' ? 'home' : item.path.slice(1)}`)}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Profile Dropdown and Language Switcher on the right */}
        <div className="flex items-center gap-4">
          {/* Emergency Button */}
          <div className="hidden md:block relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              {isEmergency && (
                <motion.div
                  className="absolute inset-0 bg-red-500 rounded-md opacity-20"
                  initial={{ scale: 1, opacity: 0.2 }}
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.1, 0.2] 
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleEmergencyClick}
                className={cn(
                  "bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2",
                  isEmergency && "animate-pulse"
                )}
              >
                <AlertOctagon className={cn("h-4 w-4", isEmergency && "animate-ping")} />
                <span>{t(isEmergency ? 'emergency.sos' : 'nav.emergency')}</span>
              </Button>
            </motion.div>
          </div>
          
          <LanguageSwitcher />
          {username && <ProfileDropdown username={username} handle={username} onLogout={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} />}
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
            {/* Emergency Button for Mobile - Displayed prominently at the top */}
            <div className="relative mb-3">
              <motion.div 
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                {isEmergency && (
                  <motion.div
                    className="absolute inset-0 bg-red-500 rounded-md opacity-20"
                    initial={{ scale: 1, opacity: 0.2 }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.1, 0.2] 
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                <Button
                  variant="destructive"
                  size="lg"
                  className={cn(
                    "w-full justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium",
                    isEmergency && "animate-pulse"
                  )}
                  onClick={() => {
                    setIsOpen(false);
                    handleEmergencyClick();
                  }}
                >
                  <AlertOctagon className={cn("h-5 w-5", isEmergency && "animate-ping")} />
                  <span className="text-sm font-bold">
                    {t(isEmergency ? 'emergency.sos' : 'nav.emergency')}
                  </span>
                </Button>
              </motion.div>
            </div>
            
            {/* Regular navigation items */}
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link 
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
                      <span className="text-sm font-medium">{t(`nav.${item.path === '/' ? 'home' : item.path.slice(1)}`)}</span>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.nav>
  );
};