import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import { StockChart } from "@/components/stock-chart";
import { TradeModal } from "@/components/trade-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Stock } from "@shared/schema";

export default function StockDetail() {
  const [, params] = useRoute("/stocks/:id");
  const stockId = params?.id;
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const { data: stock, isLoading } = useQuery<Stock>({
    queryKey: [`/api/stocks/${stockId}`],
    enabled: !!stockId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="h-10 w-32 bg-muted animate-pulse rounded mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">종목을 찾을 수 없습니다</p>
      </div>
    );
  }

  const currentPrice = Number(stock.currentPrice);
  const previousClose = Number(stock.previousClose);
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  const isPositive = change >= 0;

  const handleTrade = (type: "buy" | "sell") => {
    setTradeType(type);
    setTradeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        <Link href="/market">
          <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
            시장으로 돌아가기
          </Button>
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight" data-testid="text-stock-name">
                {stock.name}
              </h1>
              <Badge variant="outline" className="font-mono" data-testid="badge-stock-symbol">
                {stock.symbol}
              </Badge>
            </div>
            <div className="flex items-baseline gap-3">
              <p className="text-4xl font-bold font-mono tracking-tight" data-testid="text-stock-price">
                ₩{currentPrice.toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className={cn(
                    "font-mono text-sm gap-1",
                    isPositive ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                  )}
                  data-testid="badge-price-change"
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%
                </Badge>
                <p className={cn("text-lg font-mono", isPositive ? "text-profit" : "text-loss")}>
                  {isPositive ? "+" : ""}₩{change.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => handleTrade("buy")}
              className="gap-2"
              data-testid="button-buy"
            >
              매수
            </Button>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => handleTrade("sell")}
              className="gap-2"
              data-testid="button-sell"
            >
              매도
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold mb-6" data-testid="text-chart-title">
              가격 차트
            </h2>
            <StockChart stockId={stock.id} />
          </Card>

          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4" data-testid="text-info-title">
                종목 정보
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">현재가</p>
                  <p className="font-mono font-semibold" data-testid="text-current-price">
                    ₩{currentPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">전일 종가</p>
                  <p className="font-mono" data-testid="text-previous-close">
                    ₩{previousClose.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">등락액</p>
                  <p className={cn("font-mono", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? "+" : ""}₩{change.toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">등락률</p>
                  <p className={cn("font-mono", isPositive ? "text-profit" : "text-loss")}>
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleTrade("buy")}
                data-testid="button-buy-sidebar"
              >
                매수하기
              </Button>
              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                onClick={() => handleTrade("sell")}
                data-testid="button-sell-sidebar"
              >
                매도하기
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <TradeModal
        open={tradeModalOpen}
        onOpenChange={setTradeModalOpen}
        stock={stock}
        type={tradeType}
      />
    </div>
  );
}
