import { Geolocation } from "@capacitor/geolocation";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export class SmartGlasses {
  // Get contractor location for live dispatch
  static async getLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (e) {
      console.error("Geolocation error:", e);
      return null;
    }
  }

  // Capture photo of the work site
  static async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        quality: 80
      });
      return photo.webPath;
    } catch (e) {
      console.error("Camera error:", e);
      return null;
    }
  }

  // Trigger a vibration/alert on the glasses
  static async alert() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.error("Haptics error:", e);
    }
  }
}
