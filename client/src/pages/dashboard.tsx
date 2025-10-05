import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, PieChart } from "lucide-react";
import { PortfolioChart } from "@/components/portfolio-chart";
import { HoldingsList } from "@/components/holdings-list";
import { TransactionsList } from "@/components/transactions-list";
import { StockCard } from "@/components/stock-card";
import { NewsFeed } from "@/components/news-feed";
import { cn } from "@/lib/utils";
import type { PortfolioStats, Stock } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<PortfolioStats>({
    queryKey: ["/api/portfolio/stats"],
  });

  const { data: stocks, isLoading: stocksLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const changePercent = stats?.totalProfitLossPercent || 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-0 space-y-1">
        <div className="space-y-0">
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
            포트폴리오
          </h1>
          <p className="text-xs text-muted-foreground" data-testid="text-page-subtitle">
            실시간 자산 현황과 거래 내역을 확인하세요
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">총 자산</p>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </div>
            {statsLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-1">
                <p className="text-3xl font-bold font-mono tracking-tight" data-testid="text-total-value">
                  ₩{stats?.totalValue.toLocaleString() || "0"}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={cn(
                      "font-mono text-xs gap-1",
                      isPositive ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                    )}
                    data-testid="badge-total-change"
                  >
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </Badge>
                  <p className={cn("text-sm font-mono", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? "+" : ""}₩{stats?.totalProfitLoss.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">현금</p>
              <PieChart className="w-4 h-4 text-muted-foreground" />
            </div>
            {statsLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold font-mono tracking-tight" data-testid="text-cash-balance">
                ₩{stats?.cashBalance.toLocaleString() || "0"}
              </p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">투자 원금</p>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            {statsLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-3xl font-bold font-mono tracking-tight" data-testid="text-total-cost">
                ₩{stats?.totalCost.toLocaleString() || "0"}
              </p>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">수익/손실</p>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-profit" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss" />
              )}
            </div>
            {statsLoading ? (
              <div className="h-9 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-1">
                <p
                  className={cn("text-3xl font-bold font-mono tracking-tight", isPositive ? "text-profit" : "text-loss")}
                  data-testid="text-profit-loss"
                >
                  {isPositive ? "+" : ""}₩{stats?.totalProfitLoss.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {/* 좌측 메인 영역 - 3열 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 포트폴리오 차트 - 전체 너비 */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4" data-testid="text-chart-title">
                포트폴리오 가치 변동
              </h2>
              <PortfolioChart />
            </Card>

            {/* 하단 3열 그리드 */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* 보유 종목 */}
              <div className="lg:col-span-2">
                <Card className="p-6 h-full">
                  <h2 className="text-lg font-semibold mb-4" data-testid="text-holdings-title">
                    보유 종목
                  </h2>
                  <HoldingsList />
                </Card>
              </div>

              {/* 뉴스 피드 */}
              <div className="lg:col-span-1">
                <NewsFeed limit={4} />
              </div>
            </div>
          </div>

          {/* 우측 사이드바 - 1열 */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" data-testid="text-market-title">
                  실시간 시세
                </h2>
              </div>
              {stocksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stocks?.slice(0, 4).map((stock) => (
                    <StockCard key={stock.id} stock={stock} compact />
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4" data-testid="text-transactions-title">
                최근 거래
              </h2>
              <TransactionsList limit={5} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
