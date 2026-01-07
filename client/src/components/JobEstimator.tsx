import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, FileText, Loader2, AlertTriangle, CheckCircle, DollarSign, Clock, Wrench } from "lucide-react";

interface EstimateResult {
  id: number;
  treeType: string;
  estimatedHeight: number;
  estimatedDiameter: number;
  complexity: "simple" | "moderate" | "complex" | "hazardous";
  priceMin: number;
  priceMax: number;
  confidence: number;
  analysis: string;
  requiredEquipment: string[];
  estimatedHours: number;
  riskFactors: string[];
  photoUrl?: string;
}

export default function JobEstimator() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("treePhoto", photo);
      if (description) formData.append("description", description);

      const res = await fetch("/api/job-estimate", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setEstimate(data.estimate);
      } else {
        setError(data.error || "Estimation failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/job-estimate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      
      const data = await res.json();
      if (data.success) {
        setEstimate(data.estimate);
      } else {
        setError(data.error || "Estimation failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      simple: "bg-green-500",
      moderate: "bg-yellow-500",
      complex: "bg-orange-500",
      hazardous: "bg-red-500",
    };
    return colors[complexity] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            AI Job Estimator
          </CardTitle>
          <CardDescription>
            Get instant price estimates using AI-powered photo analysis or job description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo Estimate
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photo" className="space-y-4 mt-4">
              <form onSubmit={handlePhotoEstimate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photo">Tree Photo</Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    data-testid="input-photo"
                  />
                  {photoPreview && (
                    <div className="mt-2 rounded-lg overflow-hidden border">
                      <img src={photoPreview} alt="Preview" className="max-h-64 w-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo-description">Additional Details (optional)</Label>
                  <Textarea
                    id="photo-description"
                    placeholder="Describe any specific concerns, location details, or requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="input-photo-description"
                  />
                </div>
                <Button type="submit" disabled={!photo || loading} className="w-full" data-testid="button-photo-estimate">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                  {loading ? "Analyzing..." : "Get Photo Estimate"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="text" className="space-y-4 mt-4">
              <form onSubmit={handleTextEstimate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-description">Job Description</Label>
                  <Textarea
                    id="text-description"
                    placeholder="Describe the tree service job in detail. Include tree type, size, location, and any special considerations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    data-testid="input-text-description"
                  />
                </div>
                <Button type="submit" disabled={!description.trim() || loading} className="w-full" data-testid="button-text-estimate">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  {loading ? "Analyzing..." : "Get Text Estimate"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {estimate && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estimate Results
              </CardTitle>
              <Badge className={getComplexityColor(estimate.complexity)}>
                {estimate.complexity.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Tree Type</Label>
                <p className="text-lg font-medium">{estimate.treeType}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Size</Label>
                <p className="text-lg font-medium">
                  {estimate.estimatedHeight}ft tall, {estimate.estimatedDiameter}in diameter
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-700" />
                <Label className="text-green-700 font-medium">Price Range</Label>
              </div>
              <p className="text-3xl font-bold text-green-800">
                ${estimate.priceMin.toLocaleString()} - ${estimate.priceMax.toLocaleString()}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Estimated Time</Label>
                </div>
                <p className="text-lg font-medium">{estimate.estimatedHours} hours</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <Label className="text-muted-foreground">AI Confidence</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={estimate.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(estimate.confidence * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Analysis</Label>
              <p className="text-sm leading-relaxed">{estimate.analysis}</p>
            </div>

            {estimate.requiredEquipment.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Required Equipment</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {estimate.requiredEquipment.map((eq, i) => (
                    <Badge key={i} variant="secondary">{eq}</Badge>
                  ))}
                </div>
              </div>
            )}

            {estimate.riskFactors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <Label className="text-amber-600">Risk Factors</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {estimate.riskFactors.map((risk, i) => (
                    <Badge key={i} variant="outline" className="border-amber-300 text-amber-700">{risk}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, FileText, Loader2, AlertTriangle, CheckCircle, DollarSign, Clock, Wrench } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import AR Overlay to avoid SSR issues
const AROverlay = dynamic(() => import("./AROverlay"), { ssr: false });

interface EstimateResult {
  id: number;
  treeType: string;
  estimatedHeight: number;
  estimatedDiameter: number;
  complexity: "simple" | "moderate" | "complex" | "hazardous";
  priceMin: number;
  priceMax: number;
  confidence: number;
  analysis: string;
  requiredEquipment: string[];
  estimatedHours: number;
  riskFactors: string[];
  photoUrl?: string;
  suggestedContractors?: { id: string; name: string; rating: number }[];
  location?: { lat: number; lng: number };
}

export default function JobEstimator() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Unified function to request AI estimate (photo or text)
  const fetchEstimate = async (formDataOrJson: FormData | object, isPhoto: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(isPhoto ? "/api/job-estimate" : "/api/job-estimate/text", {
        method: "POST",
        body: isPhoto ? formDataOrJson : JSON.stringify(formDataOrJson),
        headers: isPhoto ? undefined : { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setEstimate(data.estimate);

        // Automatically log AI estimate for self-learning
        await fetch("/api/log-job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: data.estimate.id, outcome: data.estimate }),
        });
      } else {
        setError(data.error || "Estimation failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return;
    const formData = new FormData();
    formData.append("treePhoto", photo);
    if (description) formData.append("description", description);
    fetchEstimate(formData, true);
  };

  const handleTextEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    fetchEstimate({ description }, false);
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      simple: "bg-green-500",
      moderate: "bg-yellow-500",
      complex: "bg-orange-500",
      hazardous: "bg-red-500",
    };
    return colors[complexity] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      {/* Job Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            AI Job Estimator
          </CardTitle>
          <CardDescription>Get instant AI-powered tree service estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="photo" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photo Estimate
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </TabsTrigger>
            </TabsList>

            {/* Photo Form */}
            <TabsContent value="photo" className="space-y-4 mt-4">
              <form onSubmit={handlePhotoEstimate} className="space-y-4">
                <Label>Tree Photo</Label>
                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoPreview && <img src={photoPreview} className="max-h-64 w-full object-contain rounded-lg border" />}
                <Label>Additional Details (optional)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                <Button type="submit" disabled={!photo || loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Get Estimate"}
                </Button>
              </form>
            </TabsContent>

            {/* Text Form */}
            <TabsContent value="text" className="space-y-4 mt-4">
              <form onSubmit={handleTextEstimate} className="space-y-4">
                <Label>Job Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                <Button type="submit" disabled={!description.trim() || loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Get Estimate"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
        </CardContent>
      </Card>

      {/* Estimate Results + AR Overlay + Contractors */}
      {estimate && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="flex justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Estimate Results
            </CardTitle>
            <Badge className={getComplexityColor(estimate.complexity)}>
              {estimate.complexity.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Price & Time */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tree Type</Label>
                <p>{estimate.treeType}</p>
              </div>
              <div>
                <Label>Size</Label>
                <p>{estimate.estimatedHeight}ft tall, {estimate.estimatedDiameter}in diameter</p>
              </div>
            </div>

            <div className="p-4 bg-green-100 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-700" />
                <Label>Price Range</Label>
              </div>
              <p className="text-3xl font-bold">${estimate.priceMin} - ${estimate.priceMax}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-white rounded-lg border">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p>{estimate.estimatedHours} hours</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <Label>AI Confidence</Label>
                <Progress value={estimate.confidence * 100} />
              </div>
            </div>

            <div>
              <Label>Analysis</Label>
              <p>{estimate.analysis}</p>
            </div>

            {/* Required Equipment */}
            {estimate.requiredEquipment.length > 0 && (
              <div>
                <Label>Required Equipment</Label>
                <div className="flex flex-wrap gap-2">
                  {estimate.requiredEquipment.map((eq, i) => (
                    <Badge key={i}>{eq}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {estimate.riskFactors.length > 0 && (
              <div>
                <Label className="text-amber-600">Risk Factors</Label>
                <div className="flex flex-wrap gap-2">
                  {estimate.riskFactors.map((risk, i) => (
                    <Badge key={i} variant="outline" className="border-amber-300 text-amber-700">{risk}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Contractors */}
            {estimate.suggestedContractors?.length > 0 && (
              <div>
                <Label>Suggested Contractors</Label>
                <ul className="space-y-1">
                  {estimate.suggestedContractors.map(c => (
                    <li key={c.id}>{c.name} — Rating: {c.rating}/5</li>
                  ))}
                </ul>
              </div>
            )}

            {/* AR Overlay */}
            {estimate.photoUrl && <AROverlay jobData={estimate} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}