import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { PriceHistory } from "@shared/schema";

interface StockChartProps {
  stockId: string;
}

export function StockChart({ stockId }: StockChartProps) {
  const { data: history, isLoading } = useQuery<PriceHistory[]>({
    queryKey: [`/api/stocks/${stockId}/history`],
  });

  if (isLoading) {
    return <div className="h-80 bg-muted animate-pulse rounded" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">차트 데이터가 없습니다</p>
      </div>
    );
  }

  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
    price: Number(item.price),
  }));

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const hasProfit = chartData[chartData.length - 1]?.price >= chartData[0]?.price;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="stockProfitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="stockLossGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          domain={[minPrice * 0.99, maxPrice * 1.01]}
          tickFormatter={(value) => `₩${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--popover-border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--popover-foreground))",
          }}
          formatter={(value: number) => [`₩${value.toLocaleString()}`, "가격"]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={hasProfit ? "hsl(var(--profit))" : "hsl(var(--loss))"}
          strokeWidth={2}
          dot={false}
          fill={hasProfit ? "url(#stockProfitGradient)" : "url(#stockLossGradient)"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
