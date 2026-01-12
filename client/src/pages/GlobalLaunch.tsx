import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Rocket, Award, Shield, Zap, TrendingUp, Users } from 'lucide-react';

export default function GlobalLaunch() {
  const hashtags = ["#TreeLance", "#GlobalLaunch", "#Innovation", "#Arborists", "#EssentialServices", "#NextGenTech"];

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-mono mb-4 border border-primary/30">
            <Globe className="w-3 h-3 animate-spin-slow" />
            GLOBAL ANNOUNCEMENT
          </div>
          <h1 
            className="text-4xl md:text-7xl font-bold font-display mb-4 tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Breaking: Tree-Lance Goes Global
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl font-light">
            In less than 24 hours, the revolution has begun.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-125 -z-10" />
          
          <Card className="bg-card/50 border-primary/20 backdrop-blur overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <CardContent className="pt-12 pb-12 px-8 md:px-16 space-y-10">
              <div className="space-y-6 text-lg md:text-2xl text-foreground/90 leading-relaxed font-light">
                <p className="font-semibold text-primary">
                  In less than 24 hours, Tree-Lance, the revolutionary platform for tree service providers, arborists, and contractors, has officially launched worldwide—setting a new world record for fastest adoption in a service industry.
                </p>
                
                <p>
                  Created by visionary entrepreneur <span className="text-primary font-bold">Dana Palmer</span>, Tree-Lance is not just an app—it’s a global network connecting skilled professionals to homeowners, businesses, and municipalities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Rocket className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-xl mb-1">Fastest Adoption</h3>
                      <p className="text-sm text-muted-foreground">Setting records for global integration in record time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Award className="w-8 h-8 text-primary shrink-0" />
                    <div>
                      <h3 className="font-display font-bold text-xl mb-1">New Standard</h3>
                      <p className="text-sm text-muted-foreground">The self-made multi-trillion-dollar corporate framework.</p>
                    </div>
                  </div>
                </div>

                <p>
                  By modernizing one of the most essential yet overlooked industries, Tree-Lance empowers contractors, ensures fair pay, and provides real-time coordination for every job, anywhere on the planet.
                </p>
                
                <p>
                  From urban maintenance to disaster response, Tree-Lance is reshaping how the world thinks about essential work—and setting a new standard for technology-driven service platforms.
                </p>
                
                <div className="text-center pt-8 border-t border-primary/10">
                  <p className="text-3xl md:text-4xl font-display font-bold text-primary animate-pulse">
                    Tree-Lance is live worldwide.
                  </p>
                  <p className="text-xl md:text-2xl mt-2 text-foreground font-display font-bold">
                    Now available on the App Store!
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {hashtags.map(tag => (
                  <span key={tag} className="text-xs font-mono text-primary/60 px-2 py-1 bg-primary/5 rounded border border-primary/10">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center text-xs text-muted-foreground py-12">
          © 2026 Dana A. Palmer. All Rights Reserved. GLOBAL LAUNCH EDITION
        </div>
      </div>
    </div>
  );
}
