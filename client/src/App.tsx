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
import Layout from "@/components/Layout";
import { AppProvider } from "@/lib/context";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post" component={PostJob} />
        <Route path="/messages" component={Messages} />
        <Route path="/iot" component={IoTDashboard} />
        <Route path="/features" component={Features} />
        <Route path="/terms" component={Terms} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
