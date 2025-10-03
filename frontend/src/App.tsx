import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import DoctorHomePage from "./pages/DoctorHomePage";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import HospitalLocator from "@/pages/HospitalLocator"; // Using the full version
import ErrorBoundary from "@/components/ErrorBoundary"; // Error boundary wrapper
import { VolunteerRegistration } from "./pages/VolunteerRegistration";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "@/pages/Register";
import PatientProfile from "./pages/PatientProfile";
import DoctorProfile from "./pages/DoctorProfile";
import Emergency from "@/pages/Emergency"; // Adding Emergency page
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import Prescriptions from './pages/Prescriptions';
import BookAppointment from './pages/BookAppointment';
import MedicationReminders from './pages/MedicationReminders';
import LabResults from './pages/LabResults';
import VitalsTracker from './pages/VitalsTracker';

// Query client (shared across app)
const queryClient = new QueryClient();


function getPayloadFromToken(token: string | null): any {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function getUsernameFromToken(token: string | null): string | null {
  const payload = getPayloadFromToken(token);
  return payload?.username || payload?.name || null;
}

function getRoleFromToken(token: string | null): string | null {
  const payload = getPayloadFromToken(token);
  return payload?.role || null;
}

// Debug flag: set to true to bypass auth/profile checks during development
const DEBUG_BYPASS_AUTH = false;

function PrivateRoute({ username }: { username: string | null }) {
  if (DEBUG_BYPASS_AUTH) return <Outlet />;
  return username ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequirePatientProfile({ children, role }: { children: React.ReactNode; role: string | null }) {
  if (DEBUG_BYPASS_AUTH) return <>{children}</>;
  // Skip patient profile enforcement for doctors
  if (role === 'doctor') return <>{children}</>;
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState<boolean | null>(() => {
    return localStorage.getItem('patientHasProfile') === '1' ? true : null;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    // If we already know we have a profile (from localStorage) we can short-circuit fetch unless route explicitly is /profile
    if (!token) { setHasProfile(false); setLoading(false); return; }
    if (hasProfile === true && location.pathname !== '/profile') { setLoading(false); return; }
    
    // Check localStorage again in case it was just updated
    const profileExists = localStorage.getItem('patientHasProfile') === '1';
    if (profileExists && location.pathname !== '/profile') {
      setHasProfile(true);
      setLoading(false);
      return;
    }
    
    fetch('/api/patient/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        let data = {};
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('JSON Parse Error in profile check:', parseError);
            data = {};
          }
        }
        setHasProfile(!!data && Object.keys(data).length > 0);
        if (data && Object.keys(data).length > 0) {
          localStorage.setItem('patientHasProfile', '1');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to check patient profile:', error);
        setHasProfile(false); 
        setLoading(false); 
      });
  }, [location.pathname, hasProfile]);

  // While loading, show lightweight placeholder (avoid flicker)
  if (loading) return <div className="p-6 text-sm text-muted-foreground">Checking profile…</div>;

  // If no profile AND not already on /profile, redirect to /profile setup
  if (hasProfile === false && location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  // Allow rendering (either profile exists OR we are on /profile to create it)
  return <>{children}</>;
}

// PageTransition wrapper for smooth page transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// LoadingScreen component for initial application load
const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
  <h1 className="text-3xl font-bold text-primary">Nabha Health</h1>
        <p className="text-muted-foreground text-center">Loading your healthcare dashboard</p>
      </motion.div>
      <div className="w-full max-w-md px-4">
        <Progress value={progress} className="h-1" />
      </div>
    </motion.div>
  );
};

const App = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setUsername(getUsernameFromToken(token));
    setRole(getRoleFromToken(token));
    
    // Simulate loading time for a smoother experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem('token');
    setUsername(getUsernameFromToken(token));
    setRole(getRoleFromToken(token));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    setRole(null);
    window.location.replace('/login');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <AnimatePresence>
            {isLoading && <LoadingScreen />}
          </AnimatePresence>
          
          <BrowserRouter>
            <PageTransition>
              <Routes>
                <Route path="/login" element={username ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />} />
                <Route path="/register" element={username ? <Navigate to="/" replace /> : <Register />} />
                
                {/* Test route (kept only if debugging) */}
                {DEBUG_BYPASS_AUTH && (
                  <Route path="/test-hospitals" element={<HospitalLocator />} />
                )}
                
                <Route element={<PrivateRoute username={username} />}>
                  <Route element={<RequirePatientProfile role={role}><MainLayout /></RequirePatientProfile>}>
                    <Route index element={role === 'doctor' ? <DoctorHomePage /> : <HomePage />} />
                    <Route path="patient" element={role === 'patient' ? <PatientDashboard /> : <Navigate to="/" replace />} />
                    <Route path="appointments/book" element={role === 'patient' ? <BookAppointment /> : <Navigate to="/" replace />} />
                    <Route path="prescriptions" element={role === 'patient' ? <Prescriptions /> : <Navigate to="/" replace />} />
                    <Route path="reminders" element={role === 'patient' ? <MedicationReminders /> : <Navigate to="/" replace />} />
                    <Route path="labs" element={role === 'patient' ? <LabResults /> : <Navigate to="/" replace />} />
                    <Route path="vitals" element={role === 'patient' ? <VitalsTracker /> : <Navigate to="/" replace />} />
                    <Route path="doctor" element={role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/" replace />} />
                    <Route path="hospitals" element={<HospitalLocator />} />
                    <Route path="volunteer" element={<VolunteerRegistration />} />
                    <Route path="emergency" element={<Emergency />} />
                    <Route path="profile" element={role === 'doctor' ? <DoctorProfile /> : <PatientProfile />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </PageTransition>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
