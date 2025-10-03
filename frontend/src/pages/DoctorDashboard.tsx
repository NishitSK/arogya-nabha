import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useState } from 'react';
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
import { authenticatedApiCall } from '@/lib/api';

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

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchAppointments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await authenticatedApiCall('/api/appointments');
      if (Array.isArray(data)) {
        data.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(()=>{
    fetchAppointments();
    const id = setInterval(fetchAppointments, 30000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const act = async (id:string, action:'accept'|'reject') => {
    if (!token) return;
    try {
      const data = await authenticatedApiCall(`/api/appointments/${id}/${action}`, { 
        method:'POST'
      });
      if (data) {
        setAppointments(prev => prev.map(a => a._id === data._id ? data : a));
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const { t } = useLanguage();

  const recentPatients = [
    { name: t('person.name.priyaSingh'), lastVisit: t('time.daysAgo').replace('{{count}}','2'), condition: t('condition.hypertension') },
    { name: t('person.name.amitGupta'), lastVisit: t('time.weeksAgo').replace('{{count}}','1'), condition: t('condition.backPain') },
    { name: t('person.name.sunitaKaur'), lastVisit: t('time.weeksAgo').replace('{{count}}','2'), condition: t('condition.regularCheckup') },
  ];

  const stats = [
    { label: t('doctor.todayAppointments'), value: "8", icon: Calendar, color: "primary" },
    { label: t('doctor.totalPatients'), value: "156", icon: Users, color: "secondary" },
    { label: t('doctor.pendingReviews'), value: "12", icon: FileText, color: "accent" },
    { label: t('doctor.teleconsults'), value: "24", icon: Video, color: "success" },
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
                {t('doctor.dashboard')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('doctor.welcome').replace('{{name}}', t('doctor.name.rajeshSharma').replace('Dr. ', '').replace('डॉ. ', '').replace('ਡਾ. ', ''))} {t('doctor.specialty').replace('{{specialty}}', t('services.generalMedicine'))}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" className="focus-ring">
                <Video className="mr-2 h-4 w-4" />
                {t('doctor.startTeleconsult')}
              </Button>
              <Button className="focus-ring">
                <Phone className="mr-2 h-4 w-4" />
                {t('doctor.emergencyCall')}
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
                  {t('doctor.todaysSchedule')}
                </h2>
                <Button variant="outline" size="sm" className="focus-ring">
                  {t('doctor.viewCalendar')}
                </Button>
              </div>
              <div className="space-y-4">
                {loading && <div className="text-sm text-muted-foreground">{t('common.loading')}</div>}
                {!loading && !appointments.length && <div className="text-sm text-muted-foreground">{t('doctor.noAppointments')}</div>}
                {appointments.map((appointment, index) => {
                  const pending = appointment.status === 'pending';
                  const scheduled = appointment.status === 'scheduled';
                  const patientName = appointment.patient?.name || appointment.patient?.username || t('common.patient');
                  const displayTime = (() => { try { return new Date(appointment.date).toLocaleString(); } catch { return appointment.time || ''; } })();
                  return (
                  <div key={appointment._id || index} className="glass border-secondary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {patientName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialization || t('services.generalMedicine')}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {displayTime}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          (appointment.type || '').toLowerCase() === 'teleconsultation' 
                            ? 'bg-accent/20 text-accent' 
                            : 'bg-primary/20 text-primary'
                        }`}>
                          {t(`appointment.${(appointment.type || 'teleconsultation').toLowerCase() === 'teleconsultation' ? 'teleconsultation' : 'inPerson'}`)}
                        </span>
                        <div className="flex flex-col gap-2">
                          {pending && (
                            <>
                              <Button size="sm" onClick={()=>act(appointment._id,'accept')} className="focus-ring text-xs">{t('doctor.accept')}</Button>
                              <Button size="sm" variant="outline" onClick={()=>act(appointment._id,'reject')} className="focus-ring text-xs">{t('doctor.reject')}</Button>
                            </>
                          )}
                          {scheduled && (
                            <Button size="sm" variant="default" className="focus-ring text-xs">{t('doctor.start')}</Button>
                          )}
                          {appointment.status === 'failed' && (
                            <span className="text-xs text-destructive">{t('doctor.unassigned')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ); })}
              </div>
            </Card>

            {/* Patient Management */}
            <Card className="glass-card p-6 border-secondary/20">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t('doctor.quickPatientActions')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">{t('doctor.writePrescription')}</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm">{t('doctor.viewVitals')}</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">{t('doctor.sendMessage')}</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col space-y-2 focus-ring">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">{t('doctor.healthReports')}</span>
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
                  {t('doctor.recentPatients')}
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
                {t('doctor.viewAllPatients')}
              </Button>
            </Card>

            {/* Pending Tasks */}
            <Card className="glass-card p-6 border-warning/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('doctor.pendingTasks')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t('doctor.labReportReviews')}</span>
                  <span className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t('doctor.prescriptionApprovals')}</span>
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t('doctor.followUpCalls')}</span>
                  <span className="bg-secondary/20 text-secondary px-2 py-1 rounded-full text-xs">2</span>
                </div>
              </div>
            </Card>

            {/* Emergency Alerts */}
            <Card className="glass-card p-6 border-destructive/20">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {t('doctor.emergencyAlerts')}
              </h2>
              <div className="space-y-3">
                <div className="glass border-destructive/30 rounded-lg p-3 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">
                    {t('doctor.highPriorityPatient')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('person.name.rameshChandra')} - {t('condition.chestPain')}
                  </p>
                  <Button size="sm" className="mt-2 w-full focus-ring">
                    {t('doctor.attendNow')}
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