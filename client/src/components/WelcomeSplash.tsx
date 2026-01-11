import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '@assets/tr33lance_logo.jpeg';

interface WelcomeSplashProps {
  onComplete: () => void;
}

export default function WelcomeSplash({ onComplete }: WelcomeSplashProps) {
  const [phase, setPhase] = useState<'loading' | 'welcome' | 'fade'>('loading');

  useEffect(() => {
    const loadingTimer = setTimeout(() => setPhase('welcome'), 1500);
    const welcomeTimer = setTimeout(() => setPhase('fade'), 3500);
    const completeTimer = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(welcomeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'fade' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f1a 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-3xl animate-pulse delay-700" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-green-400/10 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            
            <div className="holographic-grid absolute inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(rgba(74, 222, 128, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(74, 222, 128, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }} />
          </div>

          <div className="relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', duration: 1.5, bounce: 0.4 }}
              className="relative"
            >
              <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
              <img
                src={logoImage}
                alt="Tree-Lance"
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 border-primary/50 shadow-2xl mx-auto"
                style={{
                  boxShadow: '0 0 60px rgba(74, 222, 128, 0.4), 0 0 120px rgba(74, 222, 128, 0.2)',
                }}
                data-testid="img-splash-logo"
              />
            </motion.div>

            {phase === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm font-mono tracking-widest">
                  INITIALIZING SYSTEMS...
                </p>
              </motion.div>
            )}

            {phase === 'welcome' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 
                  className="text-4xl md:text-6xl font-bold font-display tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(74, 222, 128, 0.5)',
                  }}
                  data-testid="text-welcome-title"
                >
                  Welcome to Tree-Lance
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto"
                >
                  The #1 App for Tree Service Providers Globally
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="w-48 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-sm text-primary/80 font-mono tracking-wider"
                >
                  AR GLASSES • AI POWERED • INSTANT DISPATCH
                </motion.p>
              </motion.div>
            )}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-muted-foreground/50">
              © 2026 Dana A. Palmer. All Rights Reserved.
            </p>
          </div>

          <div className="holographic-scanline absolute inset-0 pointer-events-none opacity-10">
            <motion.div
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// Run the code
function run() {
    console.log('Running...');
}