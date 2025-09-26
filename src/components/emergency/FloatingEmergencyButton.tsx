import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

export const FloatingEmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const emergencyContacts = [
    { name: t("common.ambulance"), number: "108", type: "ambulance" },
    { name: t("common.police"), number: "100", type: "police" },
    { name: t("common.fire"), number: "101", type: "fire" },
    { name: t("common.hospital"), number: "+91-1765-230123", type: "hospital" },
  ];

  const handleEmergencyCall = (contact: typeof emergencyContacts[0]) => {
    // In a real app, this would initiate a call
    toast({
      title: t("emergency.callInitiated"),
      description: `${t("emergency.calling")} ${contact.name}: ${contact.number}`,
      variant: "destructive",
    });
    
    // For web apps, this would typically open the phone dialer
    window.open(`tel:${contact.number}`, '_self');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg
          bg-destructive hover:bg-destructive/90 text-destructive-foreground
          emergency-pulse focus-ring border-2 border-white/20
        `}
        aria-label="Emergency SOS"
      >
        <Phone className="h-8 w-8" />
      </Button>

      {/* Emergency Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <span>{t("emergency.services")}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Location Info */}
            <Card className="glass-card border-primary/20 p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("emergency.location")}</p>
                  <p className="text-sm text-muted-foreground">Nabha, Punjab</p>
                </div>
              </div>
            </Card>

            {/* Emergency Contacts */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>{t("emergency.quickDial")}</span>
              </h3>
              
              {emergencyContacts.map((contact, index) => (
                <Button
                  key={index}
                  onClick={() => handleEmergencyCall(contact)}
                  variant="outline"
                  className="w-full justify-between p-4 h-auto border-primary/20 hover:border-primary/40 hover:bg-primary/5 focus-ring"
                >
                  <div className="text-left">
                    <div className="font-semibold">{contact.name}</div>
                    <div className="text-sm text-muted-foreground">{contact.number}</div>
                  </div>
                  <Phone className="h-5 w-5 text-primary" />
                </Button>
              ))}
            </div>

            {/* First Aid Info */}
            <Card className="glass-card border-accent/20 p-4 bg-accent/5">
              <div className="text-sm">
                <p className="font-medium text-accent">{t("emergency.firstAid")}</p>
                <p className="text-muted-foreground mt-1">
                  {t("emergency.firstAidText")}
                </p>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};