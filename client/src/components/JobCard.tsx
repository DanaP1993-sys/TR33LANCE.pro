import { Job, useApp } from '@/lib/context';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
          <div className="mt-3 p-2 bg-muted/30 rounded text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Contractor Payout:</span>
              <span className="text-foreground">${payout}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee (20%):</span>
              <span>${platformFee}</span>
            </div>
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
