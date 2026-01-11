import { SmartGlasses } from "./glasses";
import { apiRequest } from "./queryClient";

export async function handleVoiceCommand(command: string) {
  const cmd = command.toLowerCase();
  console.log(`[VOICE-COMMAND] ${cmd}`);

  if (cmd.includes("mark job complete")) {
    // Note: In a real app, we'd need the specific jobId context
    console.log("Processing 'mark job complete'...");
    await SmartGlasses.alert();
  }

  if (cmd.includes("take photo")) {
    console.log("Processing 'take photo'...");
    const photo = await SmartGlasses.takePhoto();
    if (photo) {
      console.log("Photo captured:", photo);
      await SmartGlasses.alert();
    }
  }

  if (cmd.includes("current location")) {
    console.log("Processing 'current location'...");
    const location = await SmartGlasses.getLocation();
    if (location) {
      console.log("Contractor location:", location);
      // Sync telemetry to backend
      await apiRequest("POST", "/api/ar/telemetry", {
        deviceType: "mobile_ar",
        gpsLat: location.lat,
        gpsLng: location.lng
      });
    }
  }
}
