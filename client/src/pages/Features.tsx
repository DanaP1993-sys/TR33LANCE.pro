import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobEstimator from "@/components/JobEstimator";
import ContractorVerification from "@/components/ContractorVerification";
import PhotoUpload from "@/components/PhotoUpload";
import { DollarSign, Shield, Camera, CreditCard } from "lucide-react";

export default function Features() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tree-Lance Features</h1>
          <p className="text-muted-foreground">
            AI-powered estimates, contractor verification, and job documentation
          </p>
        </div>

        <Tabs defaultValue="estimator" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="estimator" className="flex items-center gap-2" data-testid="tab-estimator">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">AI Estimator</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2" data-testid="tab-verification">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2" data-testid="tab-photos">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Job Photos</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="estimator">
              <JobEstimator />
            </TabsContent>

            <TabsContent value="verification">
              <ContractorVerification />
            </TabsContent>

            <TabsContent value="photos">
              <PhotoUpload />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
