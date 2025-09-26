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

const HospitalLocator = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      name: "Nabha Civil Hospital",
      address: "Civil Lines, Nabha, Punjab 147201",
      phone: "+91-1765-230123",
      distance: "0.5 km",
      rating: 4.2,
      category: "government",
      services: ["Emergency", "General Medicine", "Surgery", "Pediatrics"],
      timings: "24/7",
      coordinates: { lat: 30.3752, lng: 76.1520 }
    },
    {
      name: "Max Super Speciality Hospital",
      address: "GT Road, Nabha, Punjab 147201", 
      phone: "+91-1765-245678",
      distance: "1.2 km",
      rating: 4.5,
      category: "private",
      services: ["Cardiology", "Neurology", "Oncology", "ICU"],
      timings: "24/7",
      coordinates: { lat: 30.3785, lng: 76.1485 }
    },
    {
      name: "Gurudwara Sahib Dispensary",
      address: "Gur Bazaar, Nabha, Punjab 147201",
      phone: "+91-1765-234567",
      distance: "0.8 km", 
      rating: 4.0,
      category: "charitable",
      services: ["General Medicine", "Free Medicines", "Basic Surgery"],
      timings: "6:00 AM - 10:00 PM",
      coordinates: { lat: 30.3745, lng: 76.1532 }
    },
    {
      name: "Dr. Sharma's Clinic",
      address: "Model Town, Nabha, Punjab 147201",
      phone: "+91-98765-43210",
      distance: "1.5 km",
      rating: 4.3,
      category: "clinic",
      services: ["Family Medicine", "Diabetes Care", "Hypertension"],
      timings: "9:00 AM - 8:00 PM",
      coordinates: { lat: 30.3720, lng: 76.1555 }
    }
  ];

  const categories = [
    { id: "all", label: "All Hospitals", icon: Stethoscope },
    { id: "government", label: "Government", icon: Heart },
    { id: "private", label: "Private", icon: Star },
    { id: "charitable", label: "Charitable", icon: Heart },
    { id: "clinic", label: "Clinics", icon: Eye }
  ];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.services.some(service => 
                           service.toLowerCase().includes(searchTerm.toLowerCase())
                         );
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
            Find Nearby Hospitals
          </h1>
          <p className="text-muted-foreground">
            Locate healthcare facilities in Nabha, Punjab
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals, doctors, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-primary/20 focus:border-primary/40 focus-ring"
              />
            </div>
            <Button variant="outline" className="glass-card focus-ring">
              <Filter className="mr-2 h-4 w-4" />
              Filters
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
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <Card className="glass-card p-6 mb-6 border-primary/20">
          <div className="bg-muted/20 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Interactive Map</p>
              <p className="text-sm text-muted-foreground">
                Showing {filteredHospitals.length} healthcare facilities
              </p>
            </div>
          </div>
        </Card>

        {/* Hospital List */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Healthcare Facilities ({filteredHospitals.length})
          </h2>
          
          <AnimatePresence mode="sync">
            {filteredHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.name}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                whileHover={{ scale: 1.02 }}
                transition={springTransition}
              >
                <Card className="glass-card p-6 border-primary/20 hover:shadow-hover transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-start justify-between">
                {/* Hospital Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {hospital.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{hospital.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {hospital.address} • {hospital.distance}
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {hospital.timings}
                    </div>
                    
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {hospital.phone}
                    </div>
                  </div>
                  
                  {/* Services */}
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.services.map((service, serviceIndex) => (
                        <span
                          key={serviceIndex}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {service}
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
                    Directions
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => handleCall(hospital.phone)}
                    className="focus-ring w-full md:w-auto"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call
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
              Emergency Services
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              For immediate medical assistance, call these emergency numbers:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleCall("108")}
                className="bg-destructive hover:bg-destructive/90 focus-ring"
              >
                <Phone className="mr-2 h-4 w-4" />
                Ambulance - 108
              </Button>
              <Button 
                onClick={() => handleCall("+91-1765-230123")}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10 focus-ring"
              >
                <Phone className="mr-2 h-4 w-4" />
                Civil Hospital Emergency
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