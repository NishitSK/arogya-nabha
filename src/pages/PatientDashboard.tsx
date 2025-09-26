import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { containerVariants, itemVariants, springTransition, cardVariants } from "@/lib/animations";

function PatientDashboard() {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/patient/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setPatient(data);
        setForm({
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || '',
          address: data.address || '',
          phone: data.phone || '',
        });
        setEdit(!data.name); // If no name, prompt to fill form
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/patient/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setPatient(data);
      setEdit(false);
      setSuccess('Profile updated!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Loading skeleton UI
  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-6"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    </motion.div>
  );

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

  // Using animations defined earlier

  return (
    <AnimatePresence>
      <motion.div
        key="dashboard"
        className="min-h-screen p-4 md:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        exit="hidden"
      >
        <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Patient Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {patient?.name || 'New User'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="focus-ring">
                <QrCode className="mr-2 h-4 w-4" />
                My Health ID
              </Button>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {edit && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8 flex flex-col gap-4 bg-white p-6 rounded shadow">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" required />
            <input name="age" value={form.age} onChange={handleChange} placeholder="Age" className="border p-2 rounded" type="number" required />
            <select name="gender" value={form.gender} onChange={handleChange} className="border p-2 rounded" required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border p-2 rounded" />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border p-2 rounded" />
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
          </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <AnimatePresence>
            {quickActions.map((action, index) => {
              const iconColor = cn(
                "h-8 w-8 mx-auto mb-3",
                action.color === 'primary' && 'text-primary',
                action.color === 'secondary' && 'text-secondary',
                action.color === 'accent' && 'text-accent',
                action.color === 'success' && 'text-success'
              );
              return (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  whileHover="hover"
                  whileTap="tap"
                  custom={index}
                  transition={springTransition}
                >
                  <Link to={action.href}>
                    <Card className="glass-card hover:shadow-hover transition-all duration-300 p-6 text-center border-primary/20 hover:border-primary/40 focus-ring h-full">
                      <action.icon className={iconColor} />
                      <h3 className="font-semibold text-sm text-foreground mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {action.titleHi}
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.01 }}
              transition={springTransition}
            >
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
                  <AnimatePresence>
                    {upcomingAppointments.map((appointment, index) => (
                      <motion.div 
                        key={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        custom={index}
                        className="glass border-secondary/20 rounded-lg p-4"
                        whileHover={{ scale: 1.02 }}
                        transition={springTransition}
                      >
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
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>

            {/* Health Summary */}
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.01 }}
              transition={springTransition}
            >
              <Card className="glass-card p-6 border-secondary/20 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-secondary" />
                  <h2 className="text-xl font-semibold text-foreground">
                    Health Summary
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors duration-300"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover={{ scale: 1.05 }}
                    custom={0}
                    transition={springTransition}
                  >
                    <div className="text-2xl font-bold text-primary">120/80</div>
                    <div className="text-sm text-muted-foreground">Blood Pressure</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors duration-300"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover={{ scale: 1.05 }}
                    custom={1}
                    transition={springTransition}
                  >
                    <div className="text-2xl font-bold text-secondary">72</div>
                    <div className="text-sm text-muted-foreground">Heart Rate</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors duration-300"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover={{ scale: 1.05 }}
                    custom={2}
                    transition={springTransition}
                  >
                    <div className="text-2xl font-bold text-accent">98.6°F</div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                  </motion.div>
                  <motion.div 
                    className="text-center p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors duration-300"
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover={{ scale: 1.05 }}
                    custom={3}
                    transition={springTransition}
                  >
                    <div className="text-2xl font-bold text-success">Normal</div>
                    <div className="text-sm text-muted-foreground">BMI Status</div>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
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
    </motion.div>
    </AnimatePresence>
  );
}

export default PatientDashboard;