import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Phone } from "lucide-react";

const SimpleHospitalLocator = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Simplified component with minimal dependencies
  return (
    <div className="min-h-screen p-4">
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

        {/* Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search hospitals, doctors, or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Simple Card */}
        <Card className="p-6 mb-6">
          <div className="bg-muted/20 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Simple Hospital Locator Test</p>
            </div>
          </div>
        </Card>

        {/* Emergency Info */}
        <Card className="p-6 mt-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Emergency Services
            </h3>
            <p className="text-sm mb-4">
              For immediate medical assistance, call these emergency numbers:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button>
                <Phone className="mr-2 h-4 w-4" />
                Ambulance - 108
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SimpleHospitalLocator;