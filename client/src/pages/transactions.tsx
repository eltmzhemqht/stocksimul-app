import { Card } from "@/components/ui/card";
import { TransactionsList } from "@/components/transactions-list";

export default function Transactions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-16 pb-2 space-y-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
            거래 내역
          </h1>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            모든 매수/매도 거래 기록을 확인하세요
          </p>
        </div>

        <Card className="p-6">
          <TransactionsList />
        </Card>
      </div>
    </div>
  );
}
