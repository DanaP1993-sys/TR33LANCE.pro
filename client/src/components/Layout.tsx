import { Link, useLocation } from "wouter";
import { Plus, FileText, Home, MessageCircle, Cpu, Sparkles, Download, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from '@assets/tr33lance_logo.jpeg';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/post", label: "Post Job", icon: Plus },
    { href: "/features", label: "AI Features", icon: Sparkles },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/iot", label: "IoT Center", icon: Cpu },
    { href: "/download", label: "Download App", icon: Download },
    { href: "/signup", label: "Sign Up Free", icon: UserPlus },
    { href: "/terms", label: "Terms", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar / Mobile Header */}
      <div className="w-full md:w-64 border-r border-border bg-sidebar p-4 flex flex-col justify-between sticky top-0 h-auto md:h-screen z-50">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <img 
              src={logoImage} 
              alt="TR33LANCE" 
              className="h-12 w-auto object-contain"
              data-testid="img-logo-sidebar"
            />
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 md:mt-0 p-4 rounded-lg bg-card/50 border border-border text-xs text-muted-foreground">
          <p>© 2026 Tree-Lance Inc.</p>
          <p className="mt-1">Houston, TX</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
