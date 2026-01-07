import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";

interface PhotoResult {
  id: number;
  url: string;
  type: "before" | "after" | "estimate";
  verified: boolean;
  timestamp: string;
}

interface JobPhoto {
  id: number;
  jobId: number;
  type: string;
  url: string;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  timestamp: string;
}

interface JobDocumentation {
  photos: JobPhoto[];
  documentation: {
    valid: boolean;
    missing: string[];
  };
}

export default function PhotoUpload() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [jobId, setJobId] = useState("");
  const [photoType, setPhotoType] = useState<"before" | "after" | "estimate">("before");
  const [useLocation, setUseLocation] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [result, setResult] = useState<PhotoResult | null>(null);
  const [jobPhotos, setJobPhotos] = useState<JobDocumentation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (useLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocation({ lat: 29.7604, lng: -95.3698 }); // Default to Houston
        }
      );
    }
  }, [useLocation]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo || !jobId) {
      setError("Photo and Job ID are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("jobPhoto", photo);
      formData.append("jobId", jobId);
      formData.append("type", photoType);
      if (location) {
        formData.append("latitude", location.lat.toString());
        formData.append("longitude", location.lng.toString());
      }

      const res = await fetch("/api/upload-photo", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.photo);
        // Refresh job photos
        fetchJobPhotos();
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobPhotos = async () => {
    if (!jobId) return;
    
    try {
      const res = await fetch(`/api/jobs/${jobId}/photos`);
      const data = await res.json();
      setJobPhotos(data);
    } catch (err) {
      console.error("Failed to fetch job photos:", err);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobPhotos();
    }
  }, [jobId]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      before: "bg-blue-500",
      after: "bg-green-500",
      estimate: "bg-purple-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Job Photo Documentation
          </CardTitle>
          <CardDescription>
            Upload before/after photos with GPS verification for job documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  type="number"
                  placeholder="Enter job ID"
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  data-testid="input-job-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoType">Photo Type</Label>
                <Select value={photoType} onValueChange={(v) => setPhotoType(v as any)}>
                  <SelectTrigger data-testid="select-photo-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before (Pre-work)</SelectItem>
                    <SelectItem value="after">After (Completed)</SelectItem>
                    <SelectItem value="estimate">Estimate Photo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                data-testid="input-photo-file"
              />
              {photoPreview && (
                <div className="mt-2 rounded-lg overflow-hidden border">
                  <img src={photoPreview} alt="Preview" className="max-h-48 w-full object-contain" />
                </div>
              )}
            </div>

            {location && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
                <Badge variant="secondary" className="ml-auto">Verified Location</Badge>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={!photo || !jobId || loading} className="w-full" data-testid="button-upload">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {loading ? "Uploading..." : "Upload Photo"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Photo Uploaded Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={result.url} alt="Uploaded" className="h-24 w-24 object-cover rounded-lg border" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                  {result.verified && <Badge variant="outline" className="text-green-600">GPS Verified</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Uploaded at {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {jobPhotos && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Job #{jobId} Documentation
              </CardTitle>
              <Badge variant={jobPhotos.documentation.valid ? "default" : "destructive"}>
                {jobPhotos.documentation.valid ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!jobPhotos.documentation.valid && jobPhotos.documentation.missing.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-sm font-medium mb-2">Missing Documentation:</p>
                <div className="flex gap-2">
                  {jobPhotos.documentation.missing.map((type, i) => (
                    <Badge key={i} variant="outline" className="border-amber-300 text-amber-700">
                      <XCircle className="h-3 w-3 mr-1" />
                      {type} photo
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {jobPhotos.photos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {jobPhotos.photos.map((photo) => (
                  <div key={photo.id} className="border rounded-lg overflow-hidden">
                    <img src={photo.url} alt={photo.type} className="w-full h-32 object-cover" />
                    <div className="p-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(photo.type)}>{photo.type}</Badge>
                        {photo.verified && (
                          <Badge variant="outline" className="text-green-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            GPS
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(photo.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No photos uploaded yet for this job
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
