import Map from '@/components/Map';
import JobCard from '@/components/JobCard';
import { useApp } from '@/lib/context';
import heroImage from '@assets/generated_images/dark_moody_forest_background_with_industrial_lighting.png';
import logoImage from '@assets/tr33lance_logo.jpeg';

export default function Home() {
  const { jobs } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden h-[200px] md:h-[300px] border border-border shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent z-10" />
        <img 
          src={heroImage} 
          alt="Tree Service" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-8 md:px-12">
          <img 
            src={logoImage} 
            alt="TR33LANCE.pro" 
            className="h-24 md:h-32 w-auto object-contain mb-4"
            data-testid="img-logo-hero"
          />
          <p className="text-lg md:text-xl text-white/80 max-w-lg">
            Connect with verified tree service professionals in your area. Secure payments. Fast service.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Job List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">Available Jobs</h3>
            <span className="text-xs font-mono text-muted-foreground">{jobs.length} FOUND</span>
          </div>
          
          <div className="space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
            {jobs.length === 0 && (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                No jobs available right now.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">Live Map</h3>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Jobs</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Crews</span>
            </div>
          </div>
          <Map />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
             <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-display text-primary">24h</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Response Time</div>
             </div>
             <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-display text-primary">100%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Verified Crews</div>
             </div>
             <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-display text-primary">Secure</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Stripe Payments</div>
             </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
        <p>&copy; 2024 Dana Palmer. All rights reserved.</p>
        <p className="mt-1">Tree-Lance IP</p>
      </footer>
    </div>
  );
}
