import { storage } from "./storage";
import { log } from "./vite";
import { realStockService } from "./realStockService";
import { newsService } from "./newsService";
import { cache } from "./cache";

export class PriceUpdater {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5분마다 업데이트
  private readonly MAX_CHANGE_PERCENT = 3; // 최대 3% 변동

  start() {
    if (this.intervalId) {
      log("Price updater is already running");
      return;
    }

    log("Starting price updater - updating every 5 minutes");
    
    // 즉시 한 번 실행
    this.updatePrices();
    
    // 5분마다 반복 실행
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.UPDATE_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log("Price updater stopped");
    }
  }

  private async updatePrices() {
    try {
      const stocks = await storage.getAllStocks();
      const updatePromises = stocks.map(async (stock) => {
        const currentPrice = Number(stock.currentPrice);
        const previousClose = Number(stock.previousClose);
        
        let newPrice = currentPrice;
        let changeSource = "random";
        
        // 실제 데이터 시도 (API 키가 있는 경우)
        try {
          const usSymbol = realStockService.getUSSymbol(stock.symbol);
          const realData = await realStockService.getRealTimePrice(usSymbol);
          
          if (realData) {
            // 실제 데이터를 원화로 변환 (대략적인 환율 적용)
            const exchangeRate = 1300; // USD to KRW
            newPrice = realData.price * exchangeRate;
            changeSource = "real";
            log(`🌍 Using real data for ${stock.symbol}: $${realData.price} → ₩${newPrice.toFixed(2)}`);
          }
        } catch (error) {
          log(`⚠️ Real data unavailable for ${stock.symbol}, using hybrid method`);
        }
        
        // 실제 데이터가 없으면 하이브리드 방식 사용
        if (changeSource === "random") {
          // 뉴스 영향도 계산
          const newsImpact = newsService.calculateNewsImpact(stock.symbol);
          
          // 기본 랜덤 변동 + 뉴스 영향
          const randomChange = (Math.random() - 0.5) * 2 * this.MAX_CHANGE_PERCENT;
          const totalChange = randomChange + (newsImpact * 100);
          
          newPrice = currentPrice * (1 + totalChange / 100);
          changeSource = "hybrid";
          
          if (Math.abs(newsImpact) > 0.01) {
            log(`📰 News impact on ${stock.symbol}: ${(newsImpact * 100).toFixed(2)}%`);
          }
        }
        
        // 가격을 소수점 2자리로 반올림
        const roundedPrice = Math.round(newPrice * 100) / 100;
        
        // 이전 종가를 현재 가격으로 업데이트
        await storage.updateStockPrice(stock.id, roundedPrice, currentPrice);
        
        // 가격 히스토리에 새 가격 기록
        await storage.createPriceHistory({
          stockId: stock.id,
          price: roundedPrice.toFixed(2),
        });

        const changeAmount = roundedPrice - currentPrice;
        const changePercentActual = ((changeAmount / currentPrice) * 100).toFixed(2);
        
        log(`📈 ${stock.symbol} (${stock.name}): ${currentPrice.toFixed(2)} → ${roundedPrice.toFixed(2)} (${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)}, ${changePercentActual}%) [${changeSource}]`);
      });

      await Promise.all(updatePromises);
      
      // 주가 업데이트 후 관련 캐시 무효화
      cache.deletePattern("stocks:");
      cache.deletePattern("holdings:");
      cache.deletePattern("portfolio:");
      
      log(`✅ Updated prices for ${stocks.length} stocks`);
    } catch (error) {
      log(`❌ Error updating prices: ${error}`);
    }
  }

  // 수동으로 가격 업데이트 (테스트용)
  async updatePricesNow() {
    await this.updatePrices();
  }
}

export const priceUpdater = new PriceUpdater();
