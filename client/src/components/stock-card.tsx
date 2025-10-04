import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { Stock } from "@shared/schema";

interface StockCardProps {
  stock: Stock;
  compact?: boolean;
}

export function StockCard({ stock, compact = false }: StockCardProps) {
  const currentPrice = Number(stock.currentPrice);
  const previousClose = Number(stock.previousClose);
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  const isPositive = change >= 0;

  if (compact) {
    return (
      <Link href={`/stocks/${stock.id}`}>
        <div
          className="flex items-center justify-between p-3 rounded-lg hover-elevate active-elevate-2 cursor-pointer border"
          data-testid={`card-stock-${stock.id}`}
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" data-testid={`text-stock-name-${stock.id}`}>
              {stock.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono" data-testid={`text-stock-symbol-${stock.id}`}>
              {stock.symbol}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-mono font-semibold" data-testid={`text-stock-price-${stock.id}`}>
              ₩{currentPrice.toLocaleString()}
            </p>
            <Badge
              variant={isPositive ? "default" : "destructive"}
              className={cn(
                "text-xs font-mono gap-1",
                isPositive ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
              )}
              data-testid={`badge-stock-change-${stock.id}`}
            >
              {isPositive ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/stocks/${stock.id}`}>
      <Card
        className="p-6 space-y-4 hover-elevate active-elevate-2 cursor-pointer transition-all"
        data-testid={`card-stock-${stock.id}`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg" data-testid={`text-stock-name-${stock.id}`}>
              {stock.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono" data-testid={`text-stock-symbol-${stock.id}`}>
              {stock.symbol}
            </p>
          </div>
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className={cn(
              "font-mono gap-1",
              isPositive ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
            )}
            data-testid={`badge-stock-change-${stock.id}`}
          >
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold font-mono" data-testid={`text-stock-price-${stock.id}`}>
              ₩{currentPrice.toLocaleString()}
            </p>
            <p className={cn("text-sm font-mono", isPositive ? "text-profit" : "text-loss")}>
              {isPositive ? "+" : ""}₩{change.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">전일 종가: ₩{previousClose.toLocaleString()}</p>
        </div>
      </Card>
    </Link>
  );
}
