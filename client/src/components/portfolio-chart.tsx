import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { PriceHistory } from "@shared/schema";

export function PortfolioChart() {
  const { data: history, isLoading } = useQuery<PriceHistory[]>({
    queryKey: ["/api/portfolio/history"],
  });

  if (isLoading) {
    return <div className="h-64 bg-muted animate-pulse rounded" />;
  }

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">차트 데이터가 없습니다</p>
      </div>
    );
  }

  const chartData = history.map((item) => ({
    time: new Date(item.timestamp).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
    value: Number(item.price),
  }));

  const minValue = Math.min(...chartData.map((d) => d.value));
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const hasProfit = chartData[chartData.length - 1]?.value >= chartData[0]?.value;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
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
          domain={[minValue * 0.99, maxValue * 1.01]}
          tickFormatter={(value) => `₩${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--popover-border))",
            borderRadius: "var(--radius)",
            color: "hsl(var(--popover-foreground))",
          }}
          formatter={(value: number) => [`₩${value.toLocaleString()}`, "포트폴리오 가치"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={hasProfit ? "hsl(var(--profit))" : "hsl(var(--loss))"}
          strokeWidth={2}
          dot={false}
          fill={hasProfit ? "url(#profitGradient)" : "url(#lossGradient)"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
