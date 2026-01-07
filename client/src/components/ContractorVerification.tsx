import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Award, CheckCircle, XCircle, Loader2, Star, Zap, Crown } from "lucide-react";

interface VerificationResult {
  success: boolean;
  verified: boolean;
  tier: "bronze" | "silver" | "gold";
  score: number;
  requirements: {
    met: string[];
    missing: string[];
  };
  benefits: string[];
  payoutRate: number;
}

interface TierInfo {
  tiers: {
    bronze: string[];
    silver: string[];
    gold: string[];
  };
  payoutRates: {
    bronze: number;
    silver: number;
    gold: number;
  };
}

export default function ContractorVerification() {
  const [contractorId, setContractorId] = useState("");
  const [hasInsurance, setHasInsurance] = useState(false);
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [hasLicense, setHasLicense] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [backgroundCheck, setBackgroundCheck] = useState(false);
  const [bondAmount, setBondAmount] = useState("");
  const [completedJobs, setCompletedJobs] = useState("0");
  
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contractor-tiers")
      .then(res => res.json())
      .then(data => setTierInfo(data))
      .catch(err => console.error("Failed to load tier info:", err));
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorId.trim()) {
      setError("Contractor ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/verify-contractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorId,
          hasInsurance,
          insuranceExpiry: insuranceExpiry || undefined,
          hasLicense,
          licenseNumber: licenseNumber || undefined,
          licenseExpiry: licenseExpiry || undefined,
          backgroundCheck,
          bondAmount: bondAmount ? parseFloat(bondAmount) : undefined,
          completedJobs: parseInt(completedJobs) || 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    const icons: Record<string, React.ReactNode> = {
      bronze: <Award className="h-6 w-6 text-amber-700" />,
      silver: <Star className="h-6 w-6 text-slate-400" />,
      gold: <Crown className="h-6 w-6 text-yellow-500" />,
    };
    return icons[tier] || <Shield className="h-6 w-6" />;
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-amber-700",
      silver: "bg-slate-400",
      gold: "bg-yellow-500",
    };
    return colors[tier] || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Contractor Verification
          </CardTitle>
          <CardDescription>
            Verify credentials to unlock higher payout rates and premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contractorId">Contractor ID</Label>
              <Input
                id="contractorId"
                placeholder="Enter contractor ID"
                value={contractorId}
                onChange={(e) => setContractorId(e.target.value)}
                data-testid="input-contractor-id"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance
                </h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasInsurance">Has Valid Insurance</Label>
                  <Switch
                    id="hasInsurance"
                    checked={hasInsurance}
                    onCheckedChange={setHasInsurance}
                    data-testid="switch-insurance"
                  />
                </div>
                {hasInsurance && (
                  <div className="space-y-2">
                    <Label htmlFor="insuranceExpiry">Expiry Date</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      data-testid="input-insurance-expiry"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-medium flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  License
                </h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hasLicense">Has Contractor License</Label>
                  <Switch
                    id="hasLicense"
                    checked={hasLicense}
                    onCheckedChange={setHasLicense}
                    data-testid="switch-license"
                  />
                </div>
                {hasLicense && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        placeholder="LIC-12345"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        data-testid="input-license-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="licenseExpiry">Expiry Date</Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        data-testid="input-license-expiry"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <Label htmlFor="backgroundCheck">Background Check</Label>
                <Switch
                  id="backgroundCheck"
                  checked={backgroundCheck}
                  onCheckedChange={setBackgroundCheck}
                  data-testid="switch-background"
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Label htmlFor="bondAmount">Bond Amount ($)</Label>
                <Input
                  id="bondAmount"
                  type="number"
                  placeholder="25000"
                  value={bondAmount}
                  onChange={(e) => setBondAmount(e.target.value)}
                  data-testid="input-bond"
                />
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <Label htmlFor="completedJobs">Completed Jobs</Label>
                <Input
                  id="completedJobs"
                  type="number"
                  value={completedJobs}
                  onChange={(e) => setCompletedJobs(e.target.value)}
                  data-testid="input-completed-jobs"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" data-testid="button-verify">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              {loading ? "Verifying..." : "Verify Contractor"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-2 ${result.verified ? "border-green-300 bg-green-50/30" : "border-amber-300 bg-amber-50/30"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(result.tier)}
                {result.tier.charAt(0).toUpperCase() + result.tier.slice(1)} Tier
              </CardTitle>
              <Badge className={getTierColor(result.tier)}>
                {Math.round(result.payoutRate * 100)}% Payout
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Verification Score</Label>
                <span className="font-medium">{result.score}/100</span>
              </div>
              <Progress value={result.score} className="h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Requirements Met
                </Label>
                <ul className="space-y-1">
                  {result.requirements.met.map((req, i) => (
                    <li key={i} className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {result.requirements.missing.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-amber-700 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Missing Requirements
                  </Label>
                  <ul className="space-y-1">
                    {result.requirements.missing.map((req, i) => (
                      <li key={i} className="text-sm text-amber-600 flex items-center gap-2">
                        <XCircle className="h-3 w-3" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Tier Benefits
              </Label>
              <ul className="grid gap-2 md:grid-cols-2">
                {result.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {tierInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Tier Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {(["bronze", "silver", "gold"] as const).map((tier) => (
                <div key={tier} className={`p-4 rounded-lg border-2 ${result?.tier === tier ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {getTierIcon(tier)}
                    <span className="font-bold capitalize">{tier}</span>
                    <Badge variant="secondary">{Math.round(tierInfo.payoutRates[tier] * 100)}%</Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {tierInfo.tiers[tier].map((benefit, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
