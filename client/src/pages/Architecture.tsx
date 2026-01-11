import { motion } from 'framer-motion';
import architectureImage from '../assets/architecture_diagram.png';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  HardHat, 
  Brain, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  MessageSquare, 
  Scale 
} from 'lucide-react';

const modules = [
  {
    title: "Homeowner App",
    icon: User,
    color: "text-blue-400",
    features: ["Job Request", "Live Tracking"]
  },
  {
    title: "Contractor App",
    icon: HardHat,
    color: "text-blue-400",
    features: ["Job Alerts", "Job Updates"]
  },
  {
    title: "AI Intelligence",
    icon: Brain,
    color: "text-green-400",
    features: ["Job Analysis", "Pricing AI", "Risk Detection"]
  },
  {
    title: "Job Management",
    icon: Database,
    color: "text-orange-400",
    features: ["Dispatch Engine", "Job Database"]
  },
  {
    title: "Profile & Trust",
    icon: ShieldCheck,
    color: "text-orange-400",
    features: ["Verified Contractors", "Ratings & Reviews"]
  },
  {
    title: "Payment & Escrow",
    icon: CreditCard,
    color: "text-blue-400",
    features: ["Escrow System", "Instant Payouts"]
  },
  {
    title: "Maps & Tracking",
    icon: MapPin,
    color: "text-orange-400",
    features: ["Live GPS", "ETA"]
  },
  {
    title: "Dispute & Support",
    icon: Scale,
    color: "text-blue-400",
    features: ["Dispute Resolution", "AI Documentation"]
  },
  {
    title: "Notifications & Chat",
    icon: MessageSquare,
    color: "text-blue-400",
    features: ["Push Alerts", "Live Messaging"]
  }
];

export default function Architecture() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 
            className="text-4xl md:text-6xl font-bold font-display mb-4"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Platform Architecture
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive technology ecosystem designed for the global tree service industry.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl bg-black"
        >
          <img 
            src={architectureImage} 
            alt="Tree-Lance Platform Architecture Diagram" 
            className="w-full h-auto opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, idx) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="bg-card/50 border-primary/10 hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className={`${module.color} p-2 rounded-lg bg-background/50 border border-current/20`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg font-display">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.features.map(feature => (
                        <li key={feature} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary/50" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground py-12 border-t border-border">
          <p>© 2026 Dana A. Palmer. All Rights Reserved. TREE-LANCE™ Platform</p>
        </div>
      </div>
    </div>
  );
}
