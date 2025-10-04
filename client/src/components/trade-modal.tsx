import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Minus, Plus } from "lucide-react";
import type { Stock, User } from "@shared/schema";

interface TradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: Stock;
  type: "buy" | "sell";
}

export function TradeModal({ open, onOpenChange, stock, type }: TradeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const tradeMutation = useMutation({
    mutationFn: async (data: { stockId: string; quantity: number; type: string }) => {
      return apiRequest("POST", "/api/trade", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/holdings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/stats"] });
      toast({
        title: type === "buy" ? "매수 완료" : "매도 완료",
        description: `${stock.name} ${quantity}주를 ${type === "buy" ? "매수" : "매도"}했습니다.`,
      });
      onOpenChange(false);
      setQuantity(1);
    },
    onError: (error: Error) => {
      toast({
        title: "거래 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const currentPrice = Number(stock.currentPrice);
  const total = currentPrice * quantity;
  const balance = Number(user?.balance || 0);
  const canAfford = type === "buy" ? balance >= total : true;

  const handleTrade = () => {
    if (quantity <= 0) {
      toast({
        title: "잘못된 수량",
        description: "수량은 1 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "잔액 부족",
        description: "현금이 부족합니다.",
        variant: "destructive",
      });
      return;
    }

    tradeMutation.mutate({
      stockId: stock.id,
      quantity,
      type,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-trade">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {type === "buy" ? "매수" : "매도"} - {stock.name}
          </DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            거래할 수량을 입력하세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quantity">수량</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center font-mono"
                min="1"
                data-testid="input-quantity"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                data-testid="button-increase-quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">현재가</p>
              <p className="font-mono font-semibold" data-testid="text-trade-price">
                ₩{currentPrice.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">수량</p>
              <p className="font-mono" data-testid="text-trade-quantity">
                {quantity}주
              </p>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <p className="font-semibold">총 금액</p>
              <p className="font-mono font-bold text-lg" data-testid="text-trade-total">
                ₩{total.toLocaleString()}
              </p>
            </div>
            {type === "buy" && (
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">보유 현금</p>
                <p className={`font-mono text-sm ${canAfford ? "" : "text-destructive"}`} data-testid="text-trade-balance">
                  ₩{balance.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={handleTrade}
              disabled={tradeMutation.isPending || !canAfford}
              variant={type === "buy" ? "default" : "destructive"}
              data-testid="button-confirm"
            >
              {tradeMutation.isPending
                ? "처리중..."
                : type === "buy"
                ? "매수 확인"
                : "매도 확인"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
