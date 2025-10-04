import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, TrendingUp, History, Wallet, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@shared/schema";

export function Navbar() {
  const [location] = useLocation();
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const balance = Number(user?.balance || 0);

  const navItems = [
    { path: "/", label: "대시보드", icon: LayoutDashboard },
    { path: "/market", label: "시장", icon: TrendingUp },
    { path: "/news", label: "뉴스", icon: Newspaper },
    { path: "/transactions", label: "거래내역", icon: History },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ top: 'env(safe-area-inset-top, 48px)' }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl hidden sm:inline">Stock Trader</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn("gap-2", isActive && "bg-muted")}
                      data-testid={`link-nav-${item.label}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-card border rounded-lg">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">보유 현금</p>
                <p className="font-mono font-semibold" data-testid="text-nav-balance">
                  ₩{balance.toLocaleString()}
                </p>
              </div>
              <p className="sm:hidden font-mono font-semibold" data-testid="text-nav-balance-mobile">
                ₩{balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between pb-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-1 flex-1 min-w-0", isActive && "bg-muted")}
                  data-testid={`link-nav-mobile-${item.label}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs truncate">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
