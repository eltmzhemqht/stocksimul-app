import { Card } from '@/components/ui/card';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

export function HoldingsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TransactionsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function StockCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  );
}

export function AppLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* 상태바 영역 */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        style={{ height: 'env(safe-area-inset-top, 24px)' }}
      />
      
      {/* 네비게이션 바 스켈레톤 */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4 pt-8">
          <Skeleton className="h-6 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 스켈레톤 */}
      <div className="pt-20 pb-4 px-4 space-y-6">
        {/* 대시보드 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          </div>
        </div>

        {/* 차트 스켈레톤 */}
        <ChartSkeleton />

        {/* 주식 목록 스켈레톤 */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StockCardSkeleton />
            <StockCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}