import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export default function AboutFounder() {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
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
            About the Founder
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary/90">Dana A. Palmer</h2>
          <p className="text-muted-foreground mt-2 text-lg">Creator, Inventor, and Founder of Tree-Lance</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none space-y-8 text-muted-foreground leading-relaxed"
        >
          <section className="space-y-4">
            <p className="text-lg">
              Tree-Lance was founded by Dana A. Palmer after identifying a rare and consequential gap in a critical global industry: professional tree services operating almost entirely outside modern digital infrastructure.
            </p>
            <p>
              For decades, arborists and tree service professionals have performed essential, high-risk work that protects communities, restores environments after disasters, and preserves urban ecosystems. Yet despite the importance of this work, the industry remained fragmented—reliant on word-of-mouth, paper estimates, outdated classifieds, and inconsistent standards.
            </p>
          </section>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Quote className="w-8 h-8 text-primary shrink-0" />
                <p className="text-xl italic font-display text-foreground">
                  Dana Palmer saw what others overlooked: not a small inefficiency, but a systemic failure.
                </p>
              </div>
            </CardContent>
          </Card>

          <section className="grid md:grid-cols-2 gap-8 py-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-display text-primary">Seeing the Opportunity</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Centralized digital marketplaces</li>
                <li>Standardized trust and verification systems</li>
                <li>Scalable disaster-response coordination</li>
                <li>Modern payment, scheduling, and compliance tools</li>
                <li>Global visibility for skilled workers</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-display text-primary">From Vision to Execution</h3>
              <p>
                In 2024, she formally patented the Tree-Lance platform concept, securing the intellectual foundation for a technology ecosystem designed specifically for the tree service and arboriculture industry.
              </p>
              <p>
                Dana recognized that this was not simply a business opportunity—it was a responsibility.
              </p>
            </div>
          </section>

          <section className="space-y-4 border-l-2 border-primary/30 pl-6">
            <h3 className="text-2xl font-display text-foreground">Personal Adversity to Global Vision</h3>
            <p>
              Dana Palmer’s life story is not one of privilege—it is one of endurance, survival, and transformation. Her journey through profound personal adversity forged an uncommon clarity: systems matter, access matters, and dignity in work matters.
            </p>
            <p>
              Tree-Lance is the culmination of that realization. What began as a solution to modernize an overlooked trade evolved into something larger: a framework for economic fairness, environmental responsibility, and global coordination during moments of crisis.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-8 py-8">
            <div className="bg-card/50 p-6 rounded-lg border border-border">
              <h3 className="text-xl font-display text-primary mb-4">Empowering the Industry</h3>
              <ul className="space-y-2 text-sm">
                <li>• Empower independent contractors</li>
                <li>• Elevate safety and accountability</li>
                <li>• Enable rapid disaster response</li>
                <li>• Create economic stability</li>
                <li>• Restore trust with communities</li>
              </ul>
            </div>
            <div className="bg-card/50 p-6 rounded-lg border border-border">
              <h3 className="text-xl font-display text-primary mb-4">A Vision Beyond Profit</h3>
              <p className="text-sm">
                At its core, Tree-Lance is about alignment: Between humans and nature, between labor and dignity, and between technology and responsibility.
              </p>
              <p className="text-sm mt-4">
                Stability is the foundation of peace.
              </p>
            </div>
          </section>

          <section className="text-center pt-8 border-t border-border">
            <p className="text-lg italic">
              "Dana Palmer’s work stands as proof that innovation does not require permission, that overlooked industries hold the greatest potential, and that even from the hardest beginnings, something capable of serving the world can be built."
            </p>
          </section>
        </motion.div>

        <div className="text-center text-xs text-muted-foreground pb-12">
          © 2026 Dana A. Palmer. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
