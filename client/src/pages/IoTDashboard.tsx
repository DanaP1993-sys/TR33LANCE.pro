import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plane, TreeDeciduous, Droplets, ThermometerSun, 
  Battery, Leaf, Shield, MapPin, Camera, Clock,
  AlertTriangle, CheckCircle, Loader2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface DroneSurvey {
  id: number;
  jobId: number | null;
  contractorId: string | null;
  lat: number;
  lng: number;
  altitude: number;
  status: string;
  mapUrl: string | null;
  modelUrl: string | null;
  imageCount: number | null;
  areaSquareMeters: number | null;
  findings: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface TreeSensor {
  id: number;
  treeId: string;
  name: string;
  lat: number;
  lng: number;
  species: string | null;
  soilMoisture: number | null;
  structuralHealth: number | null;
  leafHealth: number | null;
  temperature: number | null;
  humidity: number | null;
  lastReading: string | null;
  status: string;
  batteryLevel: number | null;
  createdAt: string;
}

function SensorCard({ sensor }: { sensor: TreeSensor }) {
  const getHealthColor = (value: number | null) => {
    if (value === null) return 'text-muted-foreground';
    if (value >= 80) return 'text-green-500';
    if (value >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getBatteryColor = (level: number | null) => {
    if (level === null) return 'text-muted-foreground';
    if (level >= 50) return 'text-green-500';
    if (level >= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors" data-testid={`sensor-card-${sensor.id}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TreeDeciduous className="w-4 h-4 text-primary" />
              {sensor.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-mono mt-1">{sensor.treeId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={sensor.status === 'active' ? 'default' : 'destructive'}
              className="uppercase text-[10px] font-mono tracking-wider"
            >
              {sensor.status}
            </Badge>
            <div className={cn("flex items-center gap-1 text-xs", getBatteryColor(sensor.batteryLevel))}>
              <Battery className="w-3 h-3" />
              {sensor.batteryLevel}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sensor.species && (
          <p className="text-xs text-muted-foreground">Species: <span className="text-foreground">{sensor.species}</span></p>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Droplets className="w-3 h-3" /> Soil Moisture
              </span>
              <span className={getHealthColor(sensor.soilMoisture)}>{sensor.soilMoisture ?? '--'}%</span>
            </div>
            <Progress value={sensor.soilMoisture ?? 0} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Shield className="w-3 h-3" /> Structural
              </span>
              <span className={getHealthColor(sensor.structuralHealth)}>{sensor.structuralHealth ?? '--'}%</span>
            </div>
            <Progress value={sensor.structuralHealth ?? 0} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Leaf className="w-3 h-3" /> Leaf Health
              </span>
              <span className={getHealthColor(sensor.leafHealth)}>{sensor.leafHealth ?? '--'}%</span>
            </div>
            <Progress value={sensor.leafHealth ?? 0} className="h-1" />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <ThermometerSun className="w-3 h-3" /> Temp
            </span>
            <span className="text-foreground">{sensor.temperature ?? '--'}°F</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {sensor.lat.toFixed(4)}, {sensor.lng.toFixed(4)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {sensor.lastReading ? new Date(sensor.lastReading).toLocaleString() : 'No readings'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DroneCard({ survey }: { survey: DroneSurvey }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors" data-testid={`drone-card-${survey.id}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            Survey #{survey.id}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(survey.status)}
            <Badge 
              variant={survey.status === 'completed' ? 'default' : 'secondary'}
              className="uppercase text-[10px] font-mono tracking-wider"
            >
              {survey.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span>{survey.lat.toFixed(4)}, {survey.lng.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="w-3 h-3 text-muted-foreground" />
            <span>Altitude: {survey.altitude}m</span>
          </div>
          {survey.imageCount && (
            <div className="flex items-center gap-2">
              <Camera className="w-3 h-3 text-muted-foreground" />
              <span>{survey.imageCount} images</span>
            </div>
          )}
          {survey.areaSquareMeters && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Area:</span>
              <span>{survey.areaSquareMeters.toLocaleString()} m²</span>
            </div>
          )}
        </div>

        {survey.findings && (
          <div className="p-2 bg-muted/30 rounded text-xs">
            <p className="text-muted-foreground font-medium mb-1">AI Findings:</p>
            <p className="text-foreground">{survey.findings}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
          <span>Created: {new Date(survey.createdAt).toLocaleDateString()}</span>
          {survey.completedAt && (
            <span>Completed: {new Date(survey.completedAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function IoTDashboard() {
  const queryClient = useQueryClient();

  const { data: sensors = [], isLoading: sensorsLoading } = useQuery<TreeSensor[]>({
    queryKey: ['/api/sensors'],
  });

  const { data: drones = [], isLoading: dronesLoading } = useQuery<DroneSurvey[]>({
    queryKey: ['/api/drones'],
  });

  const seedMutation = useMutation({
    mutationFn: () => fetch('/api/seed-iot', { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/drones'] });
    }
  });

  useEffect(() => {
    if (!sensorsLoading && !dronesLoading && sensors.length === 0 && drones.length === 0) {
      seedMutation.mutate();
    }
  }, [sensorsLoading, dronesLoading, sensors.length, drones.length]);

  const activeSensors = sensors.filter(s => s.status === 'active').length;
  const warningSensors = sensors.filter(s => s.status === 'warning').length;
  const completedSurveys = drones.filter(d => d.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-widest text-foreground">
              IoT Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time monitoring for smart tree sensors and drone surveys
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
              queryClient.invalidateQueries({ queryKey: ['/api/drones'] });
            }}
            className="gap-2"
            data-testid="button-refresh-iot"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <TreeDeciduous className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{sensors.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Sensors</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{activeSensors}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{warningSensors}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Warnings</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4 text-center">
              <Plane className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{completedSurveys}/{drones.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Surveys Done</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sensors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="sensors" className="gap-2" data-testid="tab-sensors">
              <TreeDeciduous className="w-4 h-4" />
              Smart Sensors
            </TabsTrigger>
            <TabsTrigger value="drones" className="gap-2" data-testid="tab-drones">
              <Plane className="w-4 h-4" />
              Drone Surveys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sensors">
            {sensorsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : sensors.length === 0 ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-8 text-center">
                  <TreeDeciduous className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sensors deployed yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Deploy IoT sensors to monitor tree health in real-time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensors.map(sensor => (
                  <SensorCard key={sensor.id} sensor={sensor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drones">
            {dronesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : drones.length === 0 ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-8 text-center">
                  <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No drone surveys scheduled</p>
                  <p className="text-xs text-muted-foreground mt-1">Schedule aerial surveys for 3D mapping and AI analysis</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {drones.map(survey => (
                  <DroneCard key={survey.id} survey={survey} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Vision 2030: Full IoT Integration</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This dashboard is Phase 3 of our technology roadmap. Coming next: AR smart glasses integration, 
                  wearable contractor sensors, and autonomous drone fleet management.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
