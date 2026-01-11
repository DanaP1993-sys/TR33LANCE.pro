import { useEffect, useState } from "react";
import { VoiceControl } from "../lib/voice";
import { handleVoiceCommand } from "../lib/aiGlass";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, MapPin, CheckCircle } from "lucide-react";

export function GlassInterface() {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let vc: VoiceControl | null = null;
    try {
      vc = new VoiceControl((cmd) => {
        handleVoiceCommand(cmd);
      });
      vc.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start voice control:", e);
    }

    return () => {
      if (vc) vc.stop();
    };
  }, []);

  return (
    <Card className="bg-zinc-950 border-lime-500/30 text-zinc-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lime-400">
          {isListening ? <Mic className="animate-pulse" /> : <MicOff />}
          AR Smart Glasses Mode
          <Badge variant="outline" className="border-lime-500/50 text-lime-500 ml-auto">
            CONNECTED
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-3 p-2 rounded bg-zinc-900 border border-zinc-800">
            <CheckCircle size={16} className="text-lime-500" />
            <span>"Mark job complete"</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded bg-zinc-900 border border-zinc-800">
            <Camera size={16} className="text-lime-500" />
            <span>"Take photo"</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded bg-zinc-900 border border-zinc-800">
            <MapPin size={16} className="text-lime-500" />
            <span>"Current location"</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 italic">
          Listening for holographic voice commands...
        </p>
      </CardContent>
    </Card>
  );
}
