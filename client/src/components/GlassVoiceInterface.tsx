import { useEffect, useState } from "react";
import { SmartGlassesVoice } from "../lib/SmartGlassesVoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Camera, MapPin, CheckCircle } from "lucide-react";

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
    <Card className="bg-zinc-950 border-lime-500/30 text-zinc-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lime-400">
          {isListening ? <Mic className="animate-pulse" /> : <MicOff />}
          AR Smart Glasses Mode
          <div className="flex gap-2 ml-auto">
            <Badge 
              variant="outline" 
              className={`cursor-pointer transition-colors ${
                bluetoothStatus === 'connected' ? 'border-blue-500 text-blue-500' : 'border-zinc-700 text-zinc-500'
              }`}
              onClick={handleBluetoothConnect}
            >
              {bluetoothStatus === 'connected' ? 'BT: ON' : bluetoothStatus === 'connecting' ? 'BT: ...' : 'BT: OFF'}
            </Badge>
            <Badge variant="outline" className="border-lime-500/50 text-lime-500">
              CONNECTED
            </Badge>
          </div>
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
        <p className="text-xs text-zinc-500 italic text-center">
          Listening for holographic voice commands...
        </p>
      </CardContent>
    </Card>
  );
}
