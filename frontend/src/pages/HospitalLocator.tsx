import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Star,
  Filter,
  Search,
  Stethoscope,
  Heart,
  Eye
} from "lucide-react";
import HospitalMap from "@/components/map/HospitalMap";
import { useLanguage } from "@/hooks/useLanguage";

const HospitalLocator = () => {
  const { t, tFormat } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [focusedHospital, setFocusedHospital] = useState<string | null>(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.2,
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  const springTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 24
  };

  const hospitals = [
    {
      nameKey: "hospitals.nabhaCivil",
      addressKey: 'address.civilLinesNabha',
      phone: "+91-1765-230123",
      distance: "0.5 km",
      rating: 4.2,
      category: "government",
      services: [
        { key: "services.emergency" },
        { key: "services.generalMedicine" },
        { key: "services.surgery" },
        { key: "services.pediatrics" }
      ],
      timingKey: 'hospital.timing.24x7',
      coordinates: { lat: 30.3752, lng: 76.1520 }
    },
    {
      nameKey: "hospitals.maxSuperSpeciality",
      addressKey: 'address.gtRoadNabha', 
      phone: "+91-1765-245678",
      distance: "1.2 km",
      rating: 4.5,
      category: "private",
      services: [
        { key: "services.cardiology" },
        { key: "services.neurology" },
        { key: "services.oncology" },
        { key: "services.icu" }
      ],
      timingKey: 'hospital.timing.24x7',
      coordinates: { lat: 30.3785, lng: 76.1485 }
    },
    {
      nameKey: "hospitals.gurudwaraSahib",
      addressKey: 'address.gurBazaarNabha',
      phone: "+91-1765-234567",
      distance: "0.8 km", 
      rating: 4.0,
      category: "charitable",
      services: [
        { key: "services.generalMedicine" },
        { key: "services.freeMedicines" },
        { key: "services.basicSurgery" }
      ],
      timingKey: 'hospital.timing.daylong',
      coordinates: { lat: 30.3745, lng: 76.1532 }
    },
    {
      nameKey: "hospitals.drSharmaClinic",
      addressKey: 'address.modelTownNabha',
      phone: "+91-98765-43210",
      distance: "1.5 km",
      rating: 4.3,
      category: "clinic",
      services: [
        { key: "services.familyMedicine" },
        { key: "services.diabetesCare" },
        { key: "services.hypertension" }
      ],
      timingKey: 'hospital.timing.standardClinic',
      coordinates: { lat: 30.3720, lng: 76.1555 }
    }
  ];

  const categories = [
    { id: "all", labelKey: "hospitals.allHospitals", icon: Stethoscope },
    { id: "government", labelKey: "hospitals.government", icon: Heart },
    { id: "private", labelKey: "hospitals.private", icon: Star },
    { id: "charitable", labelKey: "hospitals.charitable", icon: Heart },
    { id: "clinic", labelKey: "hospitals.clinics", icon: Eye }
  ];

  const filteredHospitals = hospitals.filter(hospital => {
    const localizedName = t(hospital.nameKey).toLowerCase();
    const localizedServices = hospital.services.map(s => t(s.key).toLowerCase());
    const matchesSearch = localizedName.includes(searchTerm.toLowerCase()) ||
                          localizedServices.some(s => s.includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || hospital.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDirections = (hospital: typeof hospitals[0]) => {
    // In a real app, this would open maps app with directions
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.lat},${hospital.coordinates.lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('hospitals.findNearby')}
          </h1>
          <p className="text-muted-foreground">
            {t('hospitals.locateHealthcare')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('hospitals.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-primary/20 focus:border-primary/40 focus-ring"
              />
            </div>
            <Button variant="outline" className="glass-card focus-ring">
              <Filter className="mr-2 h-4 w-4" />
              {t('hospitals.filters')}
            </Button>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="focus-ring"
              >
                <category.icon className="mr-2 h-4 w-4" />
                {t(category.labelKey)}
              </Button>
            ))}
          </div>
        </div>

        {/* Interactive Map */}
        <Card className="glass-card p-4 md:p-6 mb-6 border-primary/20">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t('hospitals.mapView')}</h2>
              <p className="text-xs text-muted-foreground">
                {tFormat('hospitals.showingFacilities', { count: filteredHospitals.length })}
              </p>
            </div>
            {focusedHospital && (
              <p className="text-xs text-primary font-medium">{t('hospitals.selected')}: {focusedHospital}</p>
            )}
          </div>
          <HospitalMap 
            hospitals={hospitals as any}
            filtered={filteredHospitals as any}
            onSelect={(h) => setFocusedHospital(t(h.nameKey))}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">{t('hospitals.dataSource')}</p>
        </Card>

        {/* Hospital List */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            {tFormat('hospitals.healthcareFacilities', { count: filteredHospitals.length })}
          </h2>
          
          <AnimatePresence mode="sync">
            {filteredHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.nameKey}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                whileHover={{ scale: 1.02 }}
                transition={springTransition}
              >
                <Card className={`glass-card p-6 border-primary/20 hover:shadow-hover transition-all duration-300 ${focusedHospital === t(hospital.nameKey) ? 'ring-2 ring-primary/50' : ''}`}>                
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                {/* Hospital Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(hospital.nameKey)}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{hospital.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {t(hospital.addressKey)} • {hospital.distance}
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {t(hospital.timingKey)}
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {hospital.phone}
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-1">{t('hospitals.services')}:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.services.map((service, serviceIndex) => (
                        <span
                          key={serviceIndex}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {t(service.key)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                  <Button
                    onClick={() => handleDirections(hospital)}
                    className="focus-ring w-full md:w-auto"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    {t('hospitals.directions')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleCall(hospital.phone)}
                    className="focus-ring w-full md:w-auto"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {t('hospitals.call')}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>

        {/* Emergency Info */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card p-6 mt-8 border-destructive/20 bg-destructive/5">
            <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">
              {t('emergency.services')}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('hospitals.emergencyAssistance')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleCall("108")}
                className="bg-destructive hover:bg-destructive/90 focus-ring"
              >
                <Phone className="mr-2 h-4 w-4" />
                {t('hospitals.ambulance')} - 108
              </Button>
              <Button 
                onClick={() => handleCall("+91-1765-230123")}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 focus-ring"
              >
                <Phone className="mr-2 h-4 w-4" />
                {t('hospitals.civilHospitalEmergency')}
              </Button>
            </div>
          </div>
        </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HospitalLocator;