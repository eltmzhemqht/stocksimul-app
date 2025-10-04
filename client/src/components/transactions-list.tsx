import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { TransactionsListSkeleton } from "@/components/loading-skeleton";
import type { TransactionWithStock } from "@shared/schema";

interface TransactionsListProps {
  limit?: number;
}

export const TransactionsList = memo(function TransactionsList({ limit }: TransactionsListProps) {
  const { data: transactions, isLoading } = useQuery<TransactionWithStock[]>({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return <TransactionsListSkeleton />;
  }

  const displayTransactions = limit ? transactions?.slice(0, limit) : transactions;

  if (!displayTransactions || displayTransactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground" data-testid="text-no-transactions">
          거래 내역이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayTransactions.map((transaction) => {
        const isBuy = transaction.type === "buy";
        return (
          <div
            key={transaction.id}
            className="flex items-start gap-3 p-3 rounded-lg border"
            data-testid={`transaction-${transaction.id}`}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                isBuy ? "bg-profit/10" : "bg-loss/10"
              )}
            >
              {isBuy ? (
                <ArrowUpRight className="w-4 h-4 text-profit" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm truncate" data-testid={`text-transaction-stock-${transaction.id}`}>
                  {transaction.stock.name}
                </p>
                <Badge
                  variant={isBuy ? "default" : "destructive"}
                  className={cn(
                    "text-xs px-1.5 py-0.5",
                    isBuy ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                  )}
                  data-testid={`badge-transaction-type-${transaction.id}`}
                >
                  {isBuy ? "매수" : "매도"}
                </Badge>
              </div>
              
              <div className="space-y-0.5">
                <p className="font-mono font-semibold text-sm" data-testid={`text-transaction-total-${transaction.id}`}>
                  ₩{Number(transaction.total).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {transaction.quantity}주 @ ₩{Number(transaction.price).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.createdAt), "M/d HH:mm", { locale: ko })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
