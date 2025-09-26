import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { Heart, Users, Phone, Car } from "lucide-react";
import { motion } from "framer-motion";

export const VolunteerRegistration = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    hasVehicle: "no"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.mobile.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      toast({
        title: "Invalid Mobile Number", 
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save to database via Supabase
    toast({
      title: "Registration Successful!",
      description: `Thank you ${formData.name}! You're now registered as a volunteer.`,
    });
    
    // Reset form
    setFormData({ name: "", mobile: "", hasVehicle: "no" });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen py-12 px-4"
    >
      <div className="container mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Local Volunteer Registration
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join our community of healthcare volunteers in Nabha, Punjab. 
            Help us provide emergency assistance to those in need.
          </p>
        </div>

        {/* Registration Form */}
        <Card className="glass-card p-8 border-primary/20">
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Volunteer Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="focus-ring border-primary/20 focus:border-primary/40"
                required
              />
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-10 focus-ring border-primary/20 focus:border-primary/40"
                  required
                />
              </div>
            </div>

            {/* Vehicle Availability */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Do you have a vehicle available for emergencies?
              </Label>
              <RadioGroup
                value={formData.hasVehicle}
                onValueChange={(value) => handleInputChange("hasVehicle", value)}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="yes" id="vehicle-yes" />
                  <Label htmlFor="vehicle-yes" className="flex items-center space-x-2 cursor-pointer">
                    <Car className="h-4 w-4 text-primary" />
                    <span>Yes, I have a vehicle</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors">
                  <RadioGroupItem value="no" id="vehicle-no" />
                  <Label htmlFor="vehicle-no" className="cursor-pointer">
                    No, I don't have a vehicle
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full focus-ring"
            >
              Register as Volunteer
            </Button>
          </form>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="glass-card p-6 border-secondary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Phone className="h-5 w-5 text-secondary" />
              <span>Emergency Response</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Receive SMS alerts when someone nearby needs emergency assistance. 
              Your quick response can save lives.
            </p>
          </Card>

          <Card className="glass-card p-6 border-accent/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Users className="h-5 w-5 text-accent" />
              <span>Community Impact</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Join a network of local volunteers working together to make 
              healthcare accessible in rural areas.
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};