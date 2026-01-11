import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { apiRequest } from "./queryClient";
import { handleVoiceCommand as handleAICommand } from "./aiGlass";

/**
 * Unified Voice + AI + Smart Glasses module
 * Works on Web (PWA), iOS, Android, and smart glasses via mobile companion
 */
export class SmartGlassesVoice {
  private recognition: any;

  constructor() {
    // Initialize Web Speech API if available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;  // Keep listening
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          console.log("Voice command recognized:", transcript);
          this.processCommand(transcript);
        }
      };

      this.recognition.onerror = (err: any) => {
        console.error("Voice recognition error:", err);
        // Auto-restart if stopped unexpectedly
        try {
          this.start();
        } catch (e) {
          console.error("Failed to restart voice recognition:", e);
        }
      };

      this.recognition.onend = () => {
        // Ensure continuous listening
        if (this.recognition) {
          try {
            this.start();
          } catch (e) {
            console.error("Failed to resume voice recognition:", e);
          }
        }
      };
    }
  }

  /** Start listening */
  start() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        // Already started
      }
    }
    console.log("Smart Glasses Voice Listening Started");
  }

  /** Stop listening */
  stop() {
    const rec = this.recognition;
    this.recognition = null; // Prevent auto-restart
    if (rec) {
      try {
        rec.stop();
      } catch (e) {
        // Already stopped
      }
    }
    console.log("Smart Glasses Voice Listening Stopped");
  }

  /** Core command processor */
  private async processCommand(command: string) {
    command = command.toLowerCase();

    // 1️⃣ AI parsing / augmentation
    // Note: handleAICommand from aiGlass.ts already performs side effects
    await handleAICommand(command);

    // 2️⃣ Specialized handling for specific commands if needed beyond handleAICommand
    if (command.includes("mark job complete")) {
      await this.alert();
    } else if (command.includes("take photo")) {
      await this.alert();
    } else if (command.includes("current location")) {
      await this.alert();
    }
  }

  /** Get GPS location */
  private async getLocation() {
    try {
      const pos = await Geolocation.getCurrentPosition();
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      console.error("Location error:", err);
      return null;
    }
  }

  /** Capture photo via camera */
  private async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        quality: 80
      });
      return photo.webPath;
    } catch (err) {
      console.error("Camera error:", err);
      return null;
    }
  }

  /** Haptic alert feedback */
  private async alert() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (err) {
      console.warn("Haptics not supported:", err);
    }
  }
}
