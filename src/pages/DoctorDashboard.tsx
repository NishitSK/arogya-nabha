import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Users, 
  Video, 
  FileText, 
  Clock, 
  Stethoscope,
  TrendingUp,
  Phone,
  MessageSquare,
  Activity
} from "lucide-react";

export const DoctorDashboard = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0
    }
  };

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 24
  };

  const todayAppointments = [
    {
      patient: "Rajesh Kumar",
      time: "10:00 AM",
      type: "In-person",
      condition: "Routine Checkup",
      status: "confirmed"
    },
    {
      patient: "Sita Devi",
      time: "11:30 AM",
      type: "Teleconsultation",
      condition: "Follow-up",
      status: "pending"
    },
    {
      patient: "Mohan Singh",
      time: "2:00 PM",
      type: "In-person",
      condition: "Diabetes Management",
      status: "confirmed"
    },
  ];

  const recentPatients = [
    { name: "Priya Sharma", lastVisit: "2 days ago", condition: "Hypertension" },
    { name: "Amit Gupta", lastVisit: "1 week ago", condition: "Back Pain" },
    { name: "Sunita Kaur", lastVisit: "2 weeks ago", condition: "Regular Checkup" },
  ];

  const stats = [
    { label: "Today's Appointments", value: "8", icon: Calendar, color: "primary" },
    { label: "Total Patients", value: "156", icon: Users, color: "secondary" },
    { label: "Pending Reviews", value: "12", icon: FileText, color: "accent" },
    { label: "Teleconsults", value: "24", icon: Video, color: "success" },
  ];

  return (
    <motion.div
      className="min-h-screen p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Doctor Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome, Dr. Rajesh Sharma - General Medicine
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" className="focus-ring">
                <Video className="mr-2 h-4 w-4" />
                Start Teleconsult
              </Button>
              <Button className="focus-ring">
                <Phone className="mr-2 h-4 w-4" />
                Emergency Call
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card p-6 text-center border-primary/20">
              <stat.icon className={`h-8 w-8 text-${stat.color} mx-auto mb-3`} />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Today's Schedule
                </h2>
                <Button variant="outline" size="sm" className="focus-ring">
                  View Calendar
                </Button>
              </div>
              <div className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <div key={index} className="glass border-secondary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {appointment.patient}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.condition}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.time}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          appointment.type === 'Teleconsultation' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {appointment.type}
                        </span>
                        <div>
                          <Button
                            size="sm"
                            variant={appointment.status === 'confirmed' ? 'default' : 'outline'}
                            className="focus-ring text-xs"
                          >
                            {appointment.status === 'confirmed' ? 'Start' : 'Confirm'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Patient Management */}
            <Card className="glass-card p-6 border-secondary/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Quick Patient Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Write Prescription</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">View Vitals</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">Send Message</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Health Reports</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Patients */}
            <Card className="glass-card p-6 border-accent/20">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-accent mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Patients
                </h2>
              </div>
              <div className="space-y-3">
                {recentPatients.map((patient, index) => (
                  <div key={index} className="glass border-primary/20 rounded-lg p-3">
                    <h3 className="font-medium text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 focus-ring">
                View All Patients
              </Button>
            </Card>

            {/* Pending Tasks */}
            <Card className="glass-card p-6 border-warning/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Pending Tasks
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Lab Report Reviews</span>
                  <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Prescription Approvals</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Follow-up Calls</span>
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs">2</span>
                </div>
              </div>
            </Card>

            {/* Emergency Alerts */}
            <Card className="glass-card p-6 border-destructive/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Emergency Alerts
              </h2>
              <div className="space-y-3">
                <div className="glass border-destructive/30 rounded-lg p-3 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">
                    High Priority Patient
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ramesh Chandra - Chest Pain
                  </p>
                  <Button size="sm" className="mt-2 w-full focus-ring">
                    Attend Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;