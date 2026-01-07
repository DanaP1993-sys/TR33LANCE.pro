import * as fs from "fs";
import * as path from "path";

export interface PhotoLocation {
  lat: number;
  lng: number;
}

export interface PhotoUploadResult {
  url: string;
  type: "before" | "after" | "estimate";
  location?: PhotoLocation;
  timestamp: Date;
  verified: boolean;
}

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadJobPhoto(
  filePath: string,
  jobId: number,
  type: "before" | "after" | "estimate",
  location?: PhotoLocation
): Promise<PhotoUploadResult> {
  try {
    const timestamp = new Date();
    const ext = path.extname(filePath);
    const filename = `job_${jobId}_${type}_${timestamp.getTime()}${ext}`;
    const destPath = path.join(UPLOADS_DIR, filename);

    fs.copyFileSync(filePath, destPath);

    try {
      fs.unlinkSync(filePath);
    } catch (e) {
    }

    const url = `/uploads/${filename}`;

    return {
      url,
      type,
      location,
      timestamp,
      verified: location !== undefined,
    };
  } catch (error: any) {
    console.error("Photo upload error:", error.message);
    throw new Error(`Photo upload failed: ${error.message}`);
  }
}

export function validateJobDocumentation(
  photos: { type: string }[]
): { valid: boolean; missing: string[] } {
  const requiredTypes = ["before", "after"];
  const uploadedTypes = photos.map((p) => p.type);
  const missing = requiredTypes.filter((t) => !uploadedTypes.includes(t));

  return {
    valid: missing.length === 0,
    missing,
  };
}

export function getJobPhotosPath(jobId: number): string[] {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);
    return files
      .filter((f) => f.startsWith(`job_${jobId}_`))
      .map((f) => `/uploads/${f}`);
  } catch (error) {
    return [];
  }
}

export function deleteJobPhoto(url: string): boolean {
  try {
    const filename = path.basename(url);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
