import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Phone, HeartPulse, Building2, AlertTriangle, Heart, FlameKindling } from "lucide-react";

const emergencyContacts = [
  {
    name: "Ambulance Services",
    number: "102",
    icon: HeartPulse,
    description: "24/7 Emergency Ambulance Service"
  },
  {
    name: "Civil Hospital Nabha",
    number: "01765-220336",
    icon: Building2,
    description: "Main Government Hospital"
  },
  {
    name: "Police Emergency",
    number: "100",
    icon: AlertTriangle,
    description: "Police Emergency Helpline"
  },
  {
    name: "Fire Emergency",
    number: "101",
    icon: FlameKindling,
    description: "Fire Brigade Emergency"
  }
];

const firstAidTips = [
  {
    title: "Heart Attack",
    steps: [
      "Call emergency services immediately",
      "Make the person sit or lie down",
      "Loosen any tight clothing",
      "If prescribed, help them take their medication"
    ]
  },
  {
    title: "Choking",
    steps: [
      "Encourage them to cough",
      "Give up to 5 back blows",
      "Perform abdominal thrusts if needed",
      "Call emergency if blockage persists"
    ]
  },
  {
    title: "Burns",
    steps: [
      "Cool the burn under running water",
      "Remove any jewelry/tight items",
      "Cover with sterile gauze",
      "Seek medical attention for serious burns"
    ]
  }
];

export default function Emergency() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 py-8"
    >
      {/* Emergency Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-destructive mb-2">Emergency Services</h1>
        <p className="text-muted-foreground">
          Quick access to emergency services and first aid information
        </p>
      </motion.div>

      {/* Emergency Numbers */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-semibold mb-4">Emergency Contacts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {emergencyContacts.map((contact, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-destructive/10 mb-4">
                    <contact.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold mb-2">{contact.name}</h3>
                  <p className="text-xl font-bold text-destructive mb-2">
                    {contact.number}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {contact.description}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => window.location.href = `tel:${contact.number}`}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* First Aid Tips */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-semibold mb-4">First Aid Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {firstAidTips.map((tip, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Heart className="h-5 w-5 text-destructive mr-2" />
                  {tip.title}
                </h3>
                <ul className="space-y-2">
                  {tip.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="text-destructive mr-2">•</span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Emergency Instructions */}
      <motion.div variants={itemVariants} className="mt-8">
        <Card className="p-6 border-destructive/20">
          <div className="flex items-start space-x-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Important Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Stay calm and assess the situation</li>
                <li>• Call emergency services immediately if needed</li>
                <li>• Don't move seriously injured persons unless necessary</li>
                <li>• Provide clear location details to emergency services</li>
                <li>• Follow dispatcher instructions carefully</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}