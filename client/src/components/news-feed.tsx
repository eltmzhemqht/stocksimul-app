import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number;
  timestamp: string;
  symbols: string[];
}

interface NewsFeedProps {
  symbol?: string;
  limit?: number;
}

export const NewsFeed = memo(function NewsFeed({ symbol, limit = 10 }: NewsFeedProps) {
  const { data: news, isLoading, refetch } = useQuery<NewsItem[]>({
    queryKey: symbol ? [`/api/news/${symbol}`] : ["/api/news"],
    refetchInterval: 5 * 60 * 1000, // 5분마다 새로고침
  });

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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">뉴스 피드</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const displayNews = news?.slice(0, limit) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {symbol ? `${symbol} 관련 뉴스` : '뉴스 피드'}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </Button>
      </div>

      {displayNews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">뉴스가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayNews.map((item) => (
            <div key={item.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
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
                  </div>
                  
                  <h3 className="font-medium text-sm leading-tight">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(item.timestamp)}
                    </span>
                    {Math.abs(item.impact) > 0.01 && (
                      <span className={cn(
                        "text-xs font-medium",
                        item.impact > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        주가 영향: {item.impact > 0 ? '+' : ''}{(item.impact * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
});
