import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, HardHat, Mail, Lock, Phone, Check, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [contractorForm, setContractorForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
  });

  const handleCustomerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: customerForm.email,
          password: customerForm.password,
          name: customerForm.name,
          role: 'homeowner',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      toast({
        title: 'Welcome to Tree-Lance!',
        description: 'Your account has been created. Your first job is FREE!',
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: contractorForm.email,
          password: contractorForm.password,
          name: contractorForm.name,
          role: 'contractor',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      toast({
        title: 'Welcome to Tree-Lance Pro!',
        description: 'Your contractor account is ready. Start accepting jobs today!',
      });
      setLocation('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 
            className="text-4xl font-bold font-display mb-2"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #86efac 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            data-testid="text-signup-title"
          >
            Join Tree-Lance
          </h1>
          <p className="text-muted-foreground">
            Free to download • First job FREE • No hidden fees
          </p>
        </motion.div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Choose your account type to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer" className="gap-2" data-testid="tab-customer">
                  <User className="w-4 h-4" />
                  Customer
                </TabsTrigger>
                <TabsTrigger value="contractor" className="gap-2" data-testid="tab-contractor">
                  <HardHat className="w-4 h-4" />
                  Contractor
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer">
                <form onSubmit={handleCustomerSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customer-name"
                        placeholder="Your name"
                        className="pl-10"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        required
                        data-testid="input-customer-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customer-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        required
                        data-testid="input-customer-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customer-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        data-testid="input-customer-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customer-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                        required
                        data-testid="input-customer-password"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">First Job FREE!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sign up today and get your first tree service job completely free.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gap-2"
                    disabled={isLoading}
                    data-testid="button-customer-signup"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Customer Account'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="contractor">
                <form onSubmit={handleContractorSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractor-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contractor-name"
                        placeholder="Your name"
                        className="pl-10"
                        value={contractorForm.name}
                        onChange={(e) => setContractorForm({ ...contractorForm, name: e.target.value })}
                        required
                        data-testid="input-contractor-name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-business">Business Name</Label>
                    <div className="relative">
                      <HardHat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contractor-business"
                        placeholder="Your Tree Service LLC"
                        className="pl-10"
                        value={contractorForm.businessName}
                        onChange={(e) => setContractorForm({ ...contractorForm, businessName: e.target.value })}
                        data-testid="input-contractor-business"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contractor-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={contractorForm.email}
                        onChange={(e) => setContractorForm({ ...contractorForm, email: e.target.value })}
                        required
                        data-testid="input-contractor-email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contractor-phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        value={contractorForm.phone}
                        onChange={(e) => setContractorForm({ ...contractorForm, phone: e.target.value })}
                        data-testid="input-contractor-phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractor-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contractor-password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        value={contractorForm.password}
                        onChange={(e) => setContractorForm({ ...contractorForm, password: e.target.value })}
                        required
                        data-testid="input-contractor-password"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Start Earning Today!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Keep 80% of every job. Instant payouts. AR glasses support. AI-powered assistance.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gap-2"
                    disabled={isLoading}
                    data-testid="button-contractor-signup"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Contractor Account'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => setLocation('/login')}
                  className="text-primary hover:underline"
                  data-testid="link-login"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          <p>© 2026 Dana A. Palmer. All Rights Reserved.</p>
          <p className="mt-1">
            By signing up, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
