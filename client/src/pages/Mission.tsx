import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Shield, Zap, TrendingUp, Users } from "lucide-react";
import founderImage from "@assets/tr33lance_logo.jpeg";

export default function Mission() {
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
              background:
                "linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            A Message from Dana Palmer
          </h1>
          <p className="text-muted-foreground text-xl">
            The Vision Behind Tree-Lance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />

          <Card className="bg-card/50 border-primary/20 backdrop-blur relative overflow-hidden">
            <CardContent className="pt-12 pb-12 px-8 md:px-12 space-y-8">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125" />
                  <img
                    src={founderImage}
                    alt="Dana Palmer"
                    className="w-32 h-32 rounded-2xl border-2 border-primary/30 relative z-10 grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>

              <div className="space-y-6 text-lg md:text-xl text-foreground/90 leading-relaxed font-light">
                <p>
                  Hi, my name is{" "}
                  <span className="text-primary font-semibold">
                    Dana Palmer
                  </span>
                  .
                </p>

                <p>
                  Today, I’m proud to introduce{" "}
                  <span className="font-display font-bold tracking-tight">
                    Tree-Lance
                  </span>
                  —a platform built for the people who protect our homes, our
                  cities, and our environment.
                </p>

                <p>
                  Tree services are essential. When storms hit, when power lines
                  fall, when neighborhoods are at risk, arborists and tree
                  professionals are the first line of defense.
                </p>

                <p>
                  Yet this industry has operated for decades without modern
                  tools. No unified marketplace. No trust system. No real-time
                  coordination.
                </p>

                <div className="py-6 border-y border-primary/10 flex items-center gap-6">
                  <Quote className="w-12 h-12 text-primary/40 shrink-0" />
                  <p className="text-2xl md:text-3xl font-display font-bold text-primary">
                    In 2024, I patented Tree-Lance.
                  </p>
                </div>

                <p>
                  It connects homeowners, businesses, and municipalities with
                  verified tree professionals—fast, transparent, and safe.
                </p>

                <p>
                  Contractors{" "}
                  <span className="text-primary font-bold">
                    keep 80% of earnings
                  </span>
                  . Tree-Lance provides the technology and support to scale
                  responsibly.
                </p>

                <p>
                  Tree-Lance isn’t about replacing skilled labor. It’s about
                  empowering it.
                </p>

                <p className="text-2xl font-display font-bold text-foreground">
                  Tree-Lance is live—and this is only the beginning.
                </p>
              </div>

              <div className="pt-8 border-t border-primary/10 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Verified
                  </span>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Instant
                  </span>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Scalable
                  </span>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Empowered
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center text-xs text-muted-foreground py-12">
          © 2026 Dana A. Palmer. All Rights Reserved.
        </div>
      </div>
    </div>
  );
}
console.log("Mission component loaded");