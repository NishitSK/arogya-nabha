
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  FileText, 
  Video, 
  MapPin, 
  Shield, 
  Book, 
  Users, 
  Heart,
  Stethoscope,
  Pill,
  Activity,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants, springTransition, cardVariants } from "@/lib/animations";

export const HomePage = () => {
  const { t } = useLanguage();

  const quickActions = [
    {
      titleKey: "home.bookAppt",
      descKey: "home.bookApptDesc",
      icon: Calendar,
      href: "/patient/appointments",
      color: "primary"
    },
    {
      titleKey: "home.healthRecords",
      descKey: "home.healthRecordsDesc",
      icon: FileText,
      href: "/patient/records",
      color: "secondary"
    },
    {
      titleKey: "home.teleconsult",
      descKey: "home.teleconsultDesc",
      icon: Video,
      href: "/patient/teleconsult",
      color: "accent"
    },
    {
      titleKey: "home.findHospitals",
      descKey: "home.findHospitalsDesc",
      icon: MapPin,
      href: "/hospitals",
      color: "success"
    }
  ];

  const healthServices = [
    {
      titleKey: "home.patientCare",
      descKey: "home.patientCareDesc",
      icon: Heart,
      count: "24/7"
    },
    {
      titleKey: "home.expertDoctors",
      descKey: "home.expertDoctorsDesc",
      icon: Stethoscope,
      count: "50+"
    },
    {
      titleKey: "home.medicineDelivery",
      descKey: "home.medicineDeliveryDesc",
      icon: Pill,
      count: "Same Day"
    },
    {
      titleKey: "home.healthMonitoring",
      descKey: "home.healthMonitoringDesc",
      icon: Activity,
      count: "Weekly"
    }
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Hero Section */}
      <section className="healthcare-gradient py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              {t('home.title')}
            </h1>
            <h2 className="text-xl md:text-2xl text-secondary mb-4">
              {t('home.subtitle')}
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
              {t('home.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="glass-card border-2 border-primary/30 hover:border-primary/50 focus-ring"
              >
                <Link to="/patient">{t('home.getStarted')}</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="glass-card border-2 border-secondary/30 hover:border-secondary/50 focus-ring"
              >
                <Link to="/emergency">
                  <Phone className="mr-2 h-5 w-5" />
                  {t('home.emergency')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('home.quickAccess')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.quickAccessDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="glass-card hover:shadow-hover transition-all duration-300 p-6 text-center border-primary/20 hover:border-primary/40 focus-ring">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${action.color}/10 mb-4`}>
                    <action.icon className={`h-8 w-8 text-${action.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(action.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(action.descKey)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Health Services Overview */}
      <section className="py-16 px-4 bg-muted/5">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('home.excellence')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('home.excellenceDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {healthServices.map((service, index) => (
              <Card key={index} className="glass-card p-6 text-center border-secondary/20">
                <service.icon className="h-12 w-12 text-secondary mx-auto mb-4" />
                <div className="text-2xl font-bold text-primary mb-2">
                  {service.count}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(service.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(service.descKey)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <Card className="glass-card max-w-2xl mx-auto p-8 border-accent/20">
            <Shield className="h-16 w-16 text-accent mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('home.joinRevolution')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t('home.joinDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="focus-ring">
                <Link to="/patient">{t('home.startPatient')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="focus-ring">
                <Link to="/doctor">{t('home.providerLogin')}</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </motion.div>
  );
};

export default HomePage;