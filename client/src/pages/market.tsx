import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { StockCard } from "@/components/stock-card";
import type { Stock } from "@shared/schema";

export default function Market() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stocks, isLoading } = useQuery<Stock[]>({
    queryKey: ["/api/stocks"],
  });

  const filteredStocks = stocks?.filter(
    (stock) =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-2 space-y-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            시장
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            실시간 주식 시세를 확인하고 거래하세요
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="종목명 또는 심볼로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {filteredStocks && filteredStocks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStocks.map((stock) => (
                  <StockCard key={stock.id} stock={stock} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground" data-testid="text-no-results">
                  검색 결과가 없습니다
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
