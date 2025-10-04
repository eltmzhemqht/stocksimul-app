import { useState, useEffect } from "react";
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
import type { Stock, User, HoldingWithStock } from "@shared/schema";

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

  const { data: holdings } = useQuery<HoldingWithStock[]>({
    queryKey: ["/api/holdings"],
  });

  // 모달이 열릴 때 수량 초기화
  useEffect(() => {
    if (open) {
      if (type === "sell") {
        const currentHolding = holdings?.find(h => h.stockId === stock.id);
        const ownedShares = currentHolding?.quantity || 0;
        setQuantity(Math.min(1, ownedShares));
      } else {
        setQuantity(1);
      }
    }
  }, [open, type, stock.id, holdings]);

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
  
  // 보유 주식 수 확인
  const currentHolding = holdings?.find(h => h.stockId === stock.id);
  const ownedShares = currentHolding?.quantity || 0;
  
  // 매수/매도 가능 여부 확인
  const canAfford = type === "buy" ? balance >= total : true;
  const canSell = type === "sell" ? quantity <= ownedShares : true;
  const isTradeValid = canAfford && canSell;

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
      <DialogContent 
        className="w-[95vw] max-w-sm mx-auto p-3" 
        style={{ 
          maxWidth: '95vw',
          width: '95vw',
          margin: '0 auto',
          padding: '12px'
        }}
        data-testid="modal-trade"
      >
        <DialogHeader className="text-center mb-4">
          <DialogTitle data-testid="text-modal-title" className="text-lg">
            {type === "buy" ? "매수" : "매도"} - {stock.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* 수량 입력 - 컴팩트하게 */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm">수량</Label>
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                data-testid="button-decrease-quantity"
                className="w-8 h-8"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                  const maxQuantity = type === "sell" ? ownedShares : Infinity;
                  setQuantity(Math.min(newQuantity, maxQuantity));
                }}
                className="text-center font-mono w-16 text-sm"
                min="1"
                max={type === "sell" ? ownedShares : undefined}
                data-testid="input-quantity"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const maxQuantity = type === "sell" ? ownedShares : Infinity;
                  setQuantity(Math.min(quantity + 1, maxQuantity));
                }}
                disabled={type === "sell" && quantity >= ownedShares}
                data-testid="button-increase-quantity"
                className="w-8 h-8"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 거래 정보 - 매우 컴팩트하게 */}
          <div className="space-y-1 p-2 bg-muted rounded text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">현재가</span>
              <span className="font-mono font-semibold" data-testid="text-trade-price">
                ₩{currentPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">수량</span>
              <span className="font-mono" data-testid="text-trade-quantity">
                {quantity}주
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t font-semibold">
              <span>총 금액</span>
              <span className="font-mono" data-testid="text-trade-total">
                ₩{total.toLocaleString()}
              </span>
            </div>
            {type === "buy" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">보유 현금</span>
                <span className={`font-mono ${canAfford ? "" : "text-destructive"}`} data-testid="text-trade-balance">
                  ₩{balance.toLocaleString()}
                </span>
              </div>
            )}
            {type === "sell" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">보유 주식</span>
                <span className={`font-mono ${canSell ? "" : "text-destructive"}`} data-testid="text-owned-shares">
                  {ownedShares}주
                </span>
              </div>
            )}
          </div>

          {/* 버튼 - 컴팩트하게 */}
          <div className="space-y-2">
            <Button
              className="w-full h-10"
              onClick={handleTrade}
              disabled={tradeMutation.isPending || !isTradeValid}
              variant={type === "buy" ? "default" : "destructive"}
              data-testid="button-confirm"
            >
              {tradeMutation.isPending
                ? "처리중..."
                : type === "buy"
                ? "매수 확인"
                : "매도 확인"}
            </Button>
            <Button
              variant="outline"
              className="w-full h-8 text-sm"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel"
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
