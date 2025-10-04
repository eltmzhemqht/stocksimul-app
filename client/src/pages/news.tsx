import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number;
  timestamp: string;
  symbols: string[];
}

export default function News() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>();

  const { data: news, isLoading, refetch } = useQuery<NewsItem[]>({
    queryKey: selectedSymbol ? [`/api/news/${selectedSymbol}`] : ["/api/news"],
    refetchInterval: 5 * 60 * 1000, // 5분마다 새로고침
  });

  const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA'];

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNews = news?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.symbols.some(symbol => symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            뉴스 피드
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            실시간 주식 관련 뉴스와 시장 동향을 확인하세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="뉴스 제목, 내용, 종목명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
          </div>

          {/* 종목 필터 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSymbol === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSymbol(undefined)}
            >
              전체
            </Button>
            {symbols.map((symbol) => (
              <Button
                key={symbol}
                variant={selectedSymbol === symbol ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSymbol(symbol)}
              >
                {symbol}
              </Button>
            ))}
          </div>
        </div>

        {/* 뉴스 목록 */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredNews.length > 0 ? (
              <div className="space-y-4">
                {filteredNews.map((item) => (
                  <Card key={item.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getSentimentIcon(item.sentiment)}
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSentimentColor(item.sentiment))}
                            >
                              {item.sentiment === 'positive' ? '긍정' : 
                               item.sentiment === 'negative' ? '부정' : '중립'}
                            </Badge>
                            {item.symbols.map((sym) => (
                              <Badge key={sym} variant="secondary" className="text-xs">
                                {sym}
                              </Badge>
                            ))}
                            {Math.abs(item.impact) > 0.01 && (
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  item.impact > 0 ? "text-green-600 border-green-300" : "text-red-600 border-red-300"
                                )}
                              >
                                주가 영향: {item.impact > 0 ? '+' : ''}{(item.impact * 100).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="font-semibold text-lg leading-tight">
                            {item.title}
                          </h3>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {item.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                              {formatTime(item.timestamp)}
                            </span>
                            <span>
                              ID: {item.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground" data-testid="text-no-results">
                  {searchQuery ? '검색 결과가 없습니다' : '뉴스가 없습니다'}
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
