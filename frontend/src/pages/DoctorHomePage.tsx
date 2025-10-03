
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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


export default function DoctorHomePage() {
  const { t } = useLanguage();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    authenticatedApiCall('/api/doctor/me')
      .then(data => {
        setDoctor(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch doctor data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>{t('common.loading')}</div>;

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
                {t('doctor.welcome').replace('{{name}}', doctor?.name || t('common.patient'))} {doctor?.specialization ? t('doctor.specialty').replace('{{specialty}}', doctor.specialization) : ''}
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6 flex flex-col items-center">
              <stat.icon className="h-8 w-8 mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-muted-foreground mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>
        {/* Quick Links */}
        <div className="flex gap-4 mb-8">
          <Button asChild variant="secondary">
            <Link to="/doctor">{t('doctor.goToDashboard')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/profile">{t('doctor.editProfile')}</Link>
          </Button>
        </div>
        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">{t('doctor.recentPatients')}</h2>
          <ul>
            <li>{t('person.name.priyaSingh')} ({t('time.daysAgo').replace('{{count}}','2')}) - {t('condition.hypertension')}</li>
            <li>{t('person.name.amitGupta')} ({t('time.weeksAgo').replace('{{count}}','1')}) - {t('condition.backPain')}</li>
            <li>{t('person.name.sunitaKaur')} ({t('time.weeksAgo').replace('{{count}}','2').replace('week','weeks')}) - {t('condition.regularCheckup')}</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

