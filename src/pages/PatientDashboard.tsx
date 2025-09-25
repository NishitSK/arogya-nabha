import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  Video, 
  Pill, 
  Clock, 
  User, 
  Heart,
  QrCode,
  Bell,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

export const PatientDashboard = () => {
  const recentActivities = [
    { type: "appointment", message: "Appointment scheduled with Dr. Sharma", time: "2 hours ago" },
    { type: "prescription", message: "New prescription available", time: "1 day ago" },
    { type: "consultation", message: "Teleconsultation completed", time: "3 days ago" },
  ];

  const upcomingAppointments = [
    { 
      doctor: "Dr. Rajesh Sharma", 
      specialty: "General Medicine", 
      date: "Tomorrow", 
      time: "10:00 AM",
      type: "In-person"
    },
    { 
      doctor: "Dr. Priya Singh", 
      specialty: "Cardiology", 
      date: "March 28", 
      time: "2:30 PM",
      type: "Teleconsultation"
    }
  ];

  const quickActions = [
    {
      title: "Book Appointment",
      titleHi: "अपॉइंटमेंट बुक करें",
      icon: Calendar,
      href: "/patient/appointments",
      color: "primary"
    },
    {
      title: "Health Records",
      titleHi: "स्वास्थ्य रिकॉर्ड",
      icon: FileText,
      href: "/patient/records",
      color: "secondary"
    },
    {
      title: "Teleconsultation",
      titleHi: "टेली-परामर्श",
      icon: Video,
      href: "/patient/teleconsult",
      color: "accent"
    },
    {
      title: "Prescriptions",
      titleHi: "दवाइयाँ",
      icon: Pill,
      href: "/patient/prescriptions",
      color: "success"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Patient Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, Rajesh Kumar
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="focus-ring">
                <QrCode className="mr-2 h-4 w-4" />
                My Health ID
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="glass-card hover:shadow-hover transition-all duration-300 p-6 text-center border-primary/20 hover:border-primary/40 focus-ring">
                <action.icon className={`h-8 w-8 text-${action.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {action.titleHi}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card className="glass-card p-6 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Upcoming Appointments
                </h2>
                <Button asChild variant="outline" size="sm" className="focus-ring">
                  <Link to="/patient/appointments">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="glass border-secondary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {appointment.doctor}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialty}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.date} at {appointment.time}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          appointment.type === 'Teleconsultation' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Health Summary */}
            <Card className="glass-card p-6 border-secondary/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Health Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">120/80</div>
                  <div className="text-sm text-muted-foreground">Blood Pressure</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">72</div>
                  <div className="text-sm text-muted-foreground">Heart Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">98.6°F</div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">Normal</div>
                  <div className="text-sm text-muted-foreground">BMI Status</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="glass-card p-6 border-accent/20">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-accent mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h2>
              </div>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Medication Reminders */}
            <Card className="glass-card p-6 border-warning/20">
              <div className="flex items-center mb-4">
                <Bell className="h-5 w-5 text-warning mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Medication Reminders
                </h2>
              </div>
              <div className="space-y-3">
                <div className="glass border-warning/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Paracetamol</p>
                      <p className="text-sm text-muted-foreground">500mg</p>
                    </div>
                    <div className="text-sm text-warning font-medium">
                      Next: 2:00 PM
                    </div>
                  </div>
                </div>
                <div className="glass border-secondary/20 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Vitamin D</p>
                      <p className="text-sm text-muted-foreground">Once daily</p>
                    </div>
                    <div className="text-sm text-secondary font-medium">
                      Next: 8:00 PM
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Health Tips */}
            <Card className="glass-card p-6 border-success/20">
              <div className="flex items-center mb-4">
                <Heart className="h-5 w-5 text-success mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Health Tips
                </h2>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  • Drink at least 8 glasses of water daily
                </p>
                <p className="mb-2">
                  • Take a 30-minute walk after dinner
                </p>
                <p>
                  • Get 7-8 hours of sleep for better health
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;