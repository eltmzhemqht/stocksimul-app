import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TransactionWithStock } from "@shared/schema";

interface TransactionsListProps {
  limit?: number;
}

export function TransactionsList({ limit }: TransactionsListProps) {
  const { data: transactions, isLoading } = useQuery<TransactionWithStock[]>({
    queryKey: ["/api/transactions"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
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
    <div className="space-y-3">
      {displayTransactions.map((transaction) => {
        const isBuy = transaction.type === "buy";
        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg border"
            data-testid={`transaction-${transaction.id}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  isBuy ? "bg-profit/10" : "bg-loss/10"
                )}
              >
                {isBuy ? (
                  <ArrowUpRight className="w-5 h-5 text-profit" />
                ) : (
                  <ArrowDownRight className="w-5 h-5 text-loss" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold" data-testid={`text-transaction-stock-${transaction.id}`}>
                    {transaction.stock.name}
                  </p>
                  <Badge
                    variant={isBuy ? "default" : "destructive"}
                    className={cn(
                      "text-xs",
                      isBuy ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                    )}
                    data-testid={`badge-transaction-type-${transaction.id}`}
                  >
                    {isBuy ? "매수" : "매도"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.createdAt), "PPP p", { locale: ko })}
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="font-mono font-semibold" data-testid={`text-transaction-total-${transaction.id}`}>
                ₩{Number(transaction.total).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                {transaction.quantity}주 @ ₩{Number(transaction.price).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
