import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Terms from "@/pages/Terms";
import PostJob from "@/pages/PostJob";
import Messages from "@/pages/Messages";
import IoTDashboard from "@/pages/IoTDashboard";
import Features from "@/pages/Features";
import Download from "@/pages/Download";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import AboutFounder from "@/pages/AboutFounder";
import Architecture from "@/pages/Architecture";
import Mission from "@/pages/Mission";
import GlobalLaunch from "@/pages/GlobalLaunch";
import Layout from "@/components/Layout";
import { AppProvider } from "@/lib/context";
import WelcomeSplash from "@/components/WelcomeSplash";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post" component={PostJob} />
        <Route path="/messages" component={Messages} />
        <Route path="/iot" component={IoTDashboard} />
        <Route path="/features" component={Features} />
        <Route path="/download" component={Download} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route path="/about-founder" component={AboutFounder} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/mission" component={Mission} />
        <Route path="/launch" component={GlobalLaunch} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('treelance_splash_seen');
    return !hasSeenSplash;
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('treelance_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {showSplash && <WelcomeSplash onComplete={handleSplashComplete} />}
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
