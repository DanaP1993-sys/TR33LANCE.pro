import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { apiRequest } from "./queryClient";
import { handleAICommand } from "./aiGlass";

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
      this.recognition.continuous = true; // Stay active for hands-free field use
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
    const aiResult = await handleAICommand(command);

    // 2️⃣ Predefined commands
    if (command.includes("mark job complete")) {
      if (aiResult.jobId) {
        await apiRequest("PATCH", `/api/jobs/${aiResult.jobId}/status`, { status: "completed" });
      }
      await this.alert();
      console.log("Job marked complete via Smart Glasses.");
    } else if (command.includes("take photo")) {
      const photoUri = await this.takePhoto();
      console.log("Photo captured:", photoUri);
      await this.alert();
    } else if (command.includes("current location")) {
      const location = await this.getLocation();
      if (location) {
        console.log("Contractor location:", location);
        await apiRequest("POST", "/api/ar/telemetry", {
          deviceType: "mobile_ar",
          gpsLat: location.lat,
          gpsLng: location.lng
        });
      }
      await this.alert();
    } else {
      // Default AI handling
      console.log("AI command processed:", aiResult.text || aiResult.title);
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

  /** Bluetooth Connectivity for External Sensors/Glasses */
  async connectBluetooth() {
    const nav = navigator as any;
    if (!nav.bluetooth) {
      console.warn("Web Bluetooth API not supported in this browser.");
      return null;
    }

    try {
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['battery_service'] }],
        optionalServices: ['generic_access']
      });

      const server = await device.gatt?.connect();
      console.log(`[BLUETOOTH] Connected to ${device.name}`);
      return { device, server };
    } catch (err) {
      console.error("Bluetooth connection failed:", err);
      return null;
    }
  }
}
