import { useEffect, useState } from "react";
import { SmartGlassesVoice } from "../lib/SmartGlassesVoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, MapPin, CheckCircle, Sparkles } from "lucide-react";

export function GlassVoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [bluetoothStatus, setBluetoothStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [voiceModule, setVoiceModule] = useState<SmartGlassesVoice | null>(null);

  useEffect(() => {
    const module = new SmartGlassesVoice();
    try {
      module.start();
      setIsListening(true);
      setVoiceModule(module);
    } catch (e) {
      console.error("Failed to start smart glasses voice:", e);
    }

    return () => {
      module.stop();
      setIsListening(false);
    };
  }, []);

  const handleBluetoothConnect = async () => {
    if (!voiceModule) return;
    setBluetoothStatus("connecting");
    const connection = await voiceModule.connectBluetooth();
    setBluetoothStatus(connection ? "connected" : "disconnected");
  };

  return (
    <Card className="bg-zinc-950/40 backdrop-blur-xl border-lime-500/20 text-zinc-100 relative overflow-hidden group">
      {/* Futuristic Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
      
      {/* Holographic Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-500/10 blur-[100px] pointer-events-none group-hover:bg-lime-500/20 transition-colors" />
      
      <CardHeader className="relative z-20">
        <CardTitle className="flex items-center gap-2 text-lime-400 font-rajdhani tracking-wider uppercase text-lg italic">
          <div className="relative">
            {isListening ? (
              <>
                <Mic className="animate-pulse relative z-10" size={20} />
                <span className="absolute inset-0 bg-lime-400/20 blur-md animate-ping rounded-full" />
              </>
            ) : (
              <MicOff size={20} className="text-zinc-600" />
            )}
          </div>
          <span className="drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]">Holographic HUD v2.0</span>
          <div className="flex gap-2 ml-auto">
            <Badge 
              variant="outline" 
              className={`cursor-pointer transition-all duration-500 font-mono text-[10px] h-5 ${
                bluetoothStatus === 'connected' 
                  ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-500'
              }`}
              onClick={handleBluetoothConnect}
            >
              {bluetoothStatus === 'connected' ? 'LINK: STABLE' : bluetoothStatus === 'connecting' ? 'SYNCING...' : 'LINK: OFF'}
            </Badge>
            <Badge variant="outline" className="border-lime-500/30 bg-lime-500/5 text-lime-500 font-mono text-[10px] h-5 shadow-[0_0_10px_rgba(163,230,53,0.2)]">
              ACTIVE_LINK
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-20 pb-8">
        <div className="flex justify-between items-end">
          <div className="space-y-3 flex-1">
            <div className="text-[10px] font-mono text-lime-500/50 uppercase tracking-[0.2em] mb-4">Voice Command Matrix</div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: CheckCircle, text: "Mark job complete", cmd: "EXECUTE_COMPLETE" },
                { icon: Camera, text: "Take photo", cmd: "IMG_CAPTURE" },
                { icon: MapPin, text: "Current location", cmd: "GPS_BEACON" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group/item">
                  <div className="w-8 h-8 rounded border border-lime-500/20 bg-lime-500/5 flex items-center justify-center group-hover/item:border-lime-400/50 transition-colors shadow-inner">
                    <item.icon size={14} className="text-lime-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-rajdhani font-semibold text-zinc-300 group-hover/item:text-white transition-colors">"{item.text}"</span>
                    <span className="text-[9px] font-mono text-zinc-600 tracking-tighter">{item.cmd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Futuristic Visualizer Decoration */}
          <div className="flex gap-1 h-12 items-end opacity-40">
            {[2, 5, 3, 8, 4, 6, 2, 7].map((h, i) => (
              <div 
                key={i} 
                className="w-1 bg-lime-400/40 rounded-t-full" 
                style={{ height: `${h * 12.5}%`, animationDelay: `${i * 0.1}s` }} 
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-lime-500/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-lime-500 animate-[pulse_2s_infinite]" />
          <p className="text-[10px] font-mono text-lime-400/60 uppercase tracking-widest">
            Awaiting Neuro-Voice Input Stream...
          </p>
          <Sparkles size={12} className="text-lime-500/30 ml-auto" />
        </div>
      </CardContent>

      {/* Edge Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-lime-500/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-lime-500/20 pointer-events-none" />
    </Card>
  );
}
