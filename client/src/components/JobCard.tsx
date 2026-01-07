import { Job, useApp } from '@/lib/context';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, DollarSign, Clock, CheckCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import paypalQr from '@assets/IMG_7307_1767779744891.jpeg';

export default function JobCard({ job }: { job: Job }) {
  const { acceptJob } = useApp();

  const platformFee = (job.price * 0.2).toFixed(2);
  const payout = (job.price * 0.8).toFixed(2);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{job.title}</CardTitle>
          <Badge variant={job.status === 'open' ? 'default' : 'secondary'} 
            className={cn(
              "uppercase tracking-wider font-mono text-[10px]",
              job.status === 'open' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            {job.status}
          </Badge>
        </div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center text-foreground">
            <DollarSign className="w-4 h-4 mr-1 text-primary" />
            ${job.price}
          </div>
          <div className="flex items-center text-muted-foreground text-xs">
            <MapPin className="w-3 h-3 mr-1" />
            Houston, TX
          </div>
        </div>

        {job.status !== 'open' && (
          <div className="mt-3 space-y-2">
            <div className="p-2 bg-muted/30 rounded text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Contractor Payout:</span>
                <span className="text-foreground">${payout}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee (20%):</span>
                <span>${platformFee}</span>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full gap-2 text-[10px] h-8 uppercase tracking-wider font-mono">
                  <QrCode className="w-3 h-3" />
                  PayPal QR
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-background border-border">
                <DialogHeader>
                  <DialogTitle className="text-center font-display uppercase tracking-widest text-primary">Scan. Pay. Go.</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                  <div className="rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl">
                    <img 
                      src={paypalQr} 
                      alt="PayPal QR Code" 
                      className="w-full h-auto max-w-[250px]"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground font-mono uppercase tracking-tighter">Branch Out Bro's Payment Gateway</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {job.status === 'open' ? (
          <Button onClick={() => acceptJob(job.id)} className="w-full font-bold tracking-wide">
            ACCEPT JOB
          </Button>
        ) : (
          <div className="flex items-center justify-center w-full text-sm text-primary font-medium p-2 bg-primary/10 rounded">
            <CheckCircle className="w-4 h-4 mr-2" />
            Assigned to {job.contractor}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

