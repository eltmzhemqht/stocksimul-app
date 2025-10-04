import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { HoldingWithStock } from "@shared/schema";

export function HoldingsList() {
  const { data: holdings, isLoading } = useQuery<HoldingWithStock[]>({
    queryKey: ["/api/holdings"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!holdings || holdings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground" data-testid="text-no-holdings">
          보유 중인 종목이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {holdings.map((holding) => {
        const isProfit = holding.profitLoss >= 0;
        return (
          <Link key={holding.id} href={`/stocks/${holding.stockId}`}>
            <div
              className="flex items-center justify-between p-4 rounded-lg border hover-elevate active-elevate-2 cursor-pointer"
              data-testid={`holding-${holding.id}`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold" data-testid={`text-holding-name-${holding.id}`}>
                    {holding.stock.name}
                  </p>
                  <Badge variant="outline" className="text-xs font-mono">
                    {holding.stock.symbol}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <p className="text-muted-foreground">
                    수량: <span className="font-mono">{holding.quantity}</span>
                  </p>
                  <p className="text-muted-foreground">
                    평균단가: <span className="font-mono">₩{Number(holding.averagePrice).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="font-mono font-semibold" data-testid={`text-holding-value-${holding.id}`}>
                  ₩{holding.currentValue.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <Badge
                    variant={isProfit ? "default" : "destructive"}
                    className={cn(
                      "text-xs font-mono gap-1",
                      isProfit ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                    )}
                    data-testid={`badge-holding-change-${holding.id}`}
                  >
                    {isProfit ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                    {isProfit ? "+" : ""}
                    {holding.profitLossPercent.toFixed(2)}%
                  </Badge>
                  <p className={cn("text-sm font-mono", isProfit ? "text-profit" : "text-loss")}>
                    {isProfit ? "+" : ""}₩{holding.profitLoss.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
