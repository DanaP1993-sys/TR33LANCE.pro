import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Apple, 
  Download, 
  Users, 
  Wrench, 
  Star, 
  Shield, 
  Zap,
  CheckCircle,
  Globe
} from "lucide-react";
import logoImage from '@assets/tr33lance_logo.jpeg';

export default function DownloadPage() {
  const appStoreUrl = "https://apps.apple.com/app/tree-lance";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.treelance";
  const webAppUrl = window.location.origin;

  const customerFeatures = [
    "Instant job posting with AI-powered estimates",
    "Real-time GPS tracking of contractors",
    "Secure escrow payments via Stripe",
    "Direct messaging with contractors",
    "Photo documentation of completed work",
    "Verified contractor profiles and reviews"
  ];

  const contractorFeatures = [
    "AR Smart Glasses integration for hands-free work",
    "Voice-controlled job management",
    "Real-time job alerts and dispatch",
    "Instant payouts (80% of job revenue)",
    "Drone survey and IoT sensor integration",
    "Verification tiers: Bronze, Silver, Gold, Platinum"
  ];

  return (
    <div className="min-h-screen space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <img 
            src={logoImage} 
            alt="Tree-Lance" 
            className="h-24 w-auto rounded-xl shadow-2xl border-2 border-primary/30"
            data-testid="img-logo-download"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
          Welcome to Tree-Lance
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The #1 App for Tree Service Providers Globally. Connect homeowners with verified contractors instantly.
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-primary/50 text-primary">
            <Globe className="w-3 h-3 mr-1" />
            Available Worldwide
          </Badge>
          <Badge variant="outline" className="border-green-500/50 text-green-500">
            <Shield className="w-3 h-3 mr-1" />
            Verified Contractors
          </Badge>
          <Badge variant="outline" className="border-blue-500/50 text-blue-500">
            <Zap className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <CardTitle className="text-2xl text-blue-400">For Homeowners</CardTitle>
            <CardDescription>Get tree services at your doorstep</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {customerFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-4 border-t border-border">
              <Button 
                className="w-full bg-black hover:bg-gray-800 text-white gap-2"
                onClick={() => window.open(appStoreUrl, '_blank')}
                data-testid="button-download-ios-customer"
              >
                <Apple className="w-5 h-5" />
                Download for iOS
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => window.open(playStoreUrl, '_blank')}
                data-testid="button-download-android-customer"
              >
                <Smartphone className="w-5 h-5" />
                Download for Android
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => window.open(webAppUrl, '_blank')}
                data-testid="button-open-webapp-customer"
              >
                <Globe className="w-5 h-5" />
                Use Web App
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary">For Contractors</CardTitle>
            <CardDescription>Grow your tree service business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {contractorFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="space-y-3 pt-4 border-t border-border">
              <Button 
                className="w-full bg-black hover:bg-gray-800 text-white gap-2"
                onClick={() => window.open(appStoreUrl, '_blank')}
                data-testid="button-download-ios-contractor"
              >
                <Apple className="w-5 h-5" />
                Download for iOS
              </Button>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                onClick={() => window.open(playStoreUrl, '_blank')}
                data-testid="button-download-android-contractor"
              >
                <Smartphone className="w-5 h-5" />
                Download for Android
              </Button>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => window.open(webAppUrl, '_blank')}
                data-testid="button-open-webapp-contractor"
              >
                <Globe className="w-5 h-5" />
                Use Web App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-5xl mx-auto bg-gradient-to-r from-primary/10 via-background to-primary/10 border-primary/20">
        <CardContent className="py-8 text-center space-y-4">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
            ))}
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            "Tree-Lance has transformed how we connect with customers. The AR Smart Glasses feature 
            lets me work hands-free while staying connected. Best platform for tree service professionals!"
          </p>
          <p className="text-sm text-primary font-semibold">— Verified Gold Contractor, Texas</p>
        </CardContent>
      </Card>

      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-foreground">Ready to Get Started?</h2>
        <p className="text-muted-foreground">
          Join thousands of homeowners and contractors on Tree-Lance today.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => window.open(appStoreUrl, '_blank')}
            data-testid="button-download-cta"
          >
            <Download className="w-5 h-5" />
            Download Now
          </Button>
        </div>
      </div>
    </div>
  );
}
