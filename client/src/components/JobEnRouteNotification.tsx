import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation, X, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnRouteNotification {
  id: number;
  contractorName: string;
  jobTitle: string;
  etaMinutes: number;
  contractorLat: number;
  contractorLng: number;
  jobAddress: string;
}

interface JobEnRouteNotificationProps {
  notification: EnRouteNotification | null;
  onDismiss: () => void;
}

export default function JobEnRouteNotification({ notification, onDismiss }: JobEnRouteNotificationProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <Card className="overflow-hidden border-2 border-primary/50 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Contractor En Route</p>
                  <p className="text-xs text-muted-foreground">Real-time tracking active</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={onDismiss}
                data-testid="button-dismiss-enroute"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  <Navigation className="w-3 h-3 mr-1" />
                  {notification.etaMinutes} min away
                </Badge>
                <Badge variant="outline" className="bg-muted">
                  <Clock className="w-3 h-3 mr-1" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {notification.contractorName.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">{notification.contractorName}</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{notification.jobAddress}</span>
                </div>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Job: {notification.jobTitle}
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 gap-1"
                data-testid="button-call-contractor"
              >
                <Phone className="w-3 h-3" />
                Call
              </Button>
              <Button 
                size="sm" 
                className="flex-1 gap-1 bg-primary hover:bg-primary/90"
                data-testid="button-track-live"
              >
                <MapPin className="w-3 h-3" />
                Track Live
              </Button>
            </div>
          </div>

          <motion.div
            className="h-1 bg-primary/20"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 30, ease: 'linear' }}
          />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
