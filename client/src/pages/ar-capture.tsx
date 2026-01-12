import { useState, useEffect, useRef } from "react";
import { Camera, Video, Mic, MicOff, XCircle, CheckCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickCapture {
  id: number;
  type: string;
  url: string;
  voiceCommand: string;
  createdAt: string;
  jobId: number | null;
}

interface VoiceResponse {
  recognized: boolean;
  action: string;
  audioResponse: string;
  visualFeedback?: string;
  capture?: QuickCapture;
}

export default function ARCapturePage() {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");
  const [response, setResponse] = useState<VoiceResponse | null>(null);
  const [captures, setCaptures] = useState<QuickCapture[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState<string | null>(null);
  const [contractorId] = useState("demo-contractor-1");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchCaptures();
  }, []);

  const fetchCaptures = async () => {
    try {
      const res = await fetch(`/api/ar/captures/${contractorId}`);
      const data = await res.json();
      setCaptures(data.captures || []);
    } catch (error) {
      console.error("Failed to fetch captures:", error);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setLastCommand(transcript);
      await processVoiceCommand(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processVoiceCommand = async (command: string) => {
    try {
      const res = await fetch("/api/ar/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          command,
          deviceType: "web_ar_simulator",
        }),
      });

      const data: VoiceResponse = await res.json();
      setResponse(data);

      if (data.visualFeedback) {
        triggerVisualFeedback(data.visualFeedback);
      }

      if (data.audioResponse) {
        speakResponse(data.audioResponse);
      }

      if (data.action === "video_recording_started") {
        setIsRecording(true);
      } else if (data.action === "video_recording_stopped") {
        setIsRecording(false);
      }

      if (data.capture) {
        fetchCaptures();
      }
    } catch (error) {
      console.error("Voice command error:", error);
    }
  };

  const triggerVisualFeedback = (type: string) => {
    setVisualFeedback(type);
    setTimeout(() => setVisualFeedback(null), 500);
  };

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickCapture = async (type: "photo" | "video") => {
    try {
      const res = await fetch("/api/ar/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          type,
          voiceCommand: type === "photo" ? "Manual photo capture" : "Manual video capture",
          deviceType: "web_ar_simulator",
        }),
      });

      const data = await res.json();
      if (data.success) {
        triggerVisualFeedback("green_flash");
        speakResponse(data.audioResponse);
        fetchCaptures();
      }
    } catch (error) {
      console.error("Quick capture error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen bg-black text-white p-4 transition-all duration-200 ${
        visualFeedback === "green_flash" ? "bg-green-900" : ""
      } ${visualFeedback === "red_recording_indicator" ? "bg-red-900" : ""}`}
      data-testid="ar-capture-page"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-[#00ff7f] mb-2" data-testid="text-page-title">
            AR Quick Capture
          </h1>
          <p className="text-gray-400">Smart Glasses Voice Control Simulator</p>
        </div>

        <Card className="bg-gray-900 border-[#00ff7f]/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#00ff7f]">
              <Volume2 className="w-5 h-5" />
              Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={isListening ? stopListening : startListening}
                variant={isListening ? "destructive" : "default"}
                size="lg"
                className={`${isListening ? "animate-pulse bg-red-600" : "bg-[#00ff7f] text-black hover:bg-[#00cc66]"}`}
                data-testid="button-voice-toggle"
              >
                {isListening ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                {isListening ? "Listening..." : "Start Voice"}
              </Button>

              <Button
                onClick={() => quickCapture("photo")}
                variant="outline"
                size="lg"
                className="border-[#00ff7f]/50 text-[#00ff7f]"
                data-testid="button-capture-photo"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </Button>

              <Button
                onClick={() => quickCapture("video")}
                variant="outline"
                size="lg"
                className={`border-[#00ff7f]/50 ${isRecording ? "bg-red-600 animate-pulse" : "text-[#00ff7f]"}`}
                data-testid="button-capture-video"
              >
                <Video className="w-5 h-5 mr-2" />
                {isRecording ? "Recording..." : "Record Video"}
              </Button>
            </div>

            {lastCommand && (
              <div className="text-center p-3 bg-black/50 rounded-lg" data-testid="text-last-command">
                <span className="text-gray-400">Last command: </span>
                <span className="text-white font-medium">"{lastCommand}"</span>
              </div>
            )}

            {response && (
              <div
                className={`p-4 rounded-lg ${response.recognized ? "bg-green-900/30 border border-green-500/50" : "bg-red-900/30 border border-red-500/50"}`}
                data-testid="text-voice-response"
              >
                <div className="flex items-center gap-2 mb-2">
                  {response.recognized ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-medium">{response.recognized ? "Command Recognized" : "Command Not Recognized"}</span>
                </div>
                <p className="text-gray-300">{response.audioResponse}</p>
                {response.action && <p className="text-sm text-gray-500 mt-1">Action: {response.action}</p>}
              </div>
            )}

            <div className="text-center text-sm text-gray-500">
              <p>Available commands:</p>
              <p className="text-[#00ff7f]">"Take photo" • "Record video" • "Stop recording" • "What's next" • "Mark complete"</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#00ff7f]" />
              Recent Captures ({captures.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {captures.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No captures yet. Use voice commands or buttons above to capture.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {captures.slice(0, 8).map((capture) => (
                  <div
                    key={capture.id}
                    className="relative bg-gray-800 rounded-lg overflow-hidden group"
                    data-testid={`card-capture-${capture.id}`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      {capture.type === "video" ? (
                        <Video className="w-12 h-12 text-[#00ff7f]" />
                      ) : (
                        <Camera className="w-12 h-12 text-[#00ff7f]" />
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-[#00ff7f] font-medium uppercase">{capture.type}</p>
                      <p className="text-xs text-gray-500 truncate">{capture.voiceCommand}</p>
                      {capture.jobId && (
                        <p className="text-xs text-gray-400">Job #{capture.jobId}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>HUD Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-[#00ff7f]/30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-[#00ff7f]/50 flex items-center justify-center mx-auto mb-4">
                    <div className={`w-4 h-4 rounded-full ${isListening ? "bg-green-500 animate-pulse" : "bg-gray-600"}`} />
                  </div>
                  <p className="text-[#00ff7f]">{isListening ? "Listening for commands..." : "Ready for voice input"}</p>
                </div>
              </div>

              <div className="absolute top-4 left-4 text-xs text-[#00ff7f]/70">
                <p>TR33LANCE AR v1.0</p>
                <p>Contractor: {contractorId}</p>
              </div>

              <div className="absolute top-4 right-4 text-xs text-right text-[#00ff7f]/70">
                <p>{new Date().toLocaleTimeString()}</p>
                <p>{isRecording && <span className="text-red-500 animate-pulse">● REC</span>}</p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-gray-500">
                <span>Captures: {captures.length}</span>
                <span>Device: Web AR Simulator</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
