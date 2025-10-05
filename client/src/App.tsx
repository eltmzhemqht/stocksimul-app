import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { Navbar } from "@/components/navbar";
import { Suspense, useEffect } from "react";
import { Skeleton } from "@/components/loading-skeleton";
import { StatusBar, Style } from '@capacitor/status-bar';
import { 
  LazyDashboard, 
  LazyMarket, 
  LazyNews, 
  LazyStockDetail, 
  LazyTransactions, 
  LazyNotFound 
} from "@/components/lazy-components";

function Router() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <Switch>
        <Route path="/" component={LazyDashboard} />
        <Route path="/market" component={LazyMarket} />
        <Route path="/news" component={LazyNews} />
        <Route path="/stocks/:id" component={LazyStockDetail} />
        <Route path="/transactions" component={LazyTransactions} />
        <Route component={LazyNotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    // StatusBar 설정
    const setupStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (error) {
        console.log('StatusBar setup failed:', error);
      }
    };
    
    setupStatusBar();

    // 초기 스크롤 위치를 맨 위로 설정
    const resetScrollPosition = () => {
      // 모든 스크롤 가능한 요소 찾기
      const scrollableElements = document.querySelectorAll('[style*="overflowY: auto"], [style*="overflow-y: auto"], .overflow-y-auto');
      scrollableElements.forEach((element) => {
        (element as HTMLElement).scrollTop = 0;
      });
      
      // 윈도우 스크롤 리셋
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // DOM이 로드된 후 스크롤 위치 리셋 (더 자주 실행)
    setTimeout(resetScrollPosition, 50);
    setTimeout(resetScrollPosition, 100);
    setTimeout(resetScrollPosition, 200);
    setTimeout(resetScrollPosition, 500);
    setTimeout(resetScrollPosition, 1000);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background overflow-hidden">
            {/* 상태바 영역 배경 */}
            <div 
              className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
              style={{ height: 'env(safe-area-inset-top, 48px)' }}
            />
            <Navbar />
            <div style={{ 
              paddingTop: 'calc(env(safe-area-inset-top, 48px) + 64px)', 
              height: 'calc(100vh - env(safe-area-inset-top, 48px) - 64px)', 
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '20px'
            }}>
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
