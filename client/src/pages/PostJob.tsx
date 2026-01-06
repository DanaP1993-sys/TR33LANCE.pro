import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface JobForm {
  title: string;
  description: string;
  price: string;
  lat: string;
  lng: string;
}

export default function PostJob() {
  const { addJob } = useApp();
  const [, setLocation] = useLocation();
  const { register, handleSubmit, formState: { errors } } = useForm<JobForm>();

  const onSubmit = (data: JobForm) => {
    addJob({
      title: data.title,
      description: data.description,
      price: Number(data.price),
      lat: Number(data.lat) || 29.7604,
      lng: Number(data.lng) || -95.3698,
    });
    setLocation("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <a className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </a>
        </Link>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl">Post New Job</CardTitle>
          <CardDescription>Enter details about the tree service required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Large Oak Trimming" 
                {...register("title", { required: true })} 
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <span className="text-xs text-destructive">Required</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the work needed..." 
                className="min-h-[100px]"
                {...register("description", { required: true })} 
              />
              {errors.description && <span className="text-xs text-destructive">Required</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price Estimate ($)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="300" 
                  {...register("price", { required: true, min: 1 })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Location (Coordinates for Demo)</Label>
                <div className="flex gap-2">
                  <Input placeholder="Lat" {...register("lat")} defaultValue="29.76" />
                  <Input placeholder="Lng" {...register("lng")} defaultValue="-95.36" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full font-bold tracking-wide text-lg h-12">
              POST JOB
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
