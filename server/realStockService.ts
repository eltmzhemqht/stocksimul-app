import { log } from "./vite";

export interface RealStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export class RealStockService {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private cache: Map<string, { data: RealStockData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  constructor() {
    // 환경변수에서 API 키 가져오기 (없으면 제공받은 키 사용)
    this.apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'F2T2NYMYOFTPLCKG';
    
    if (this.apiKey === 'demo') {
      log('⚠️ Using demo API key. Get a free key at: https://www.alphavantage.co/support/#api-key');
    } else {
      log('✅ Using Alpha Vantage API key for real stock data');
    }
  }

  async getRealTimePrice(symbol: string): Promise<RealStockData | null> {
    try {
      // 캐시 확인
      const cached = this.cache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Alpha Vantage API 호출
      const response = await fetch(
        `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['Error Message']) {
        log(`❌ Alpha Vantage Error for ${symbol}: ${data['Error Message']}`);
        return null;
      }

      if (data['Note']) {
        log(`⚠️ Alpha Vantage Rate Limit: ${data['Note']}`);
        return null;
      }

      const quote = data['Global Quote'];
      if (!quote || !quote['05. price']) {
        log(`❌ No data found for ${symbol}`);
        return null;
      }

      const stockData: RealStockData = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        timestamp: quote['07. latest trading day']
      };

      // 캐시에 저장
      this.cache.set(symbol, { data: stockData, timestamp: Date.now() });

      log(`📊 Real data for ${symbol}: $${stockData.price} (${stockData.changePercent}%)`);
      return stockData;

    } catch (error) {
      log(`❌ Error fetching real data for ${symbol}: ${error}`);
      return null;
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<Map<string, RealStockData>> {
    const results = new Map<string, RealStockData>();
    
    // API 호출 제한을 고려하여 순차적으로 호출
    for (const symbol of symbols) {
      const data = await this.getRealTimePrice(symbol);
      if (data) {
        results.set(symbol, data);
      }
      
      // API 호출 간격 (무료 티어 제한 고려)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // 한국 주식 심볼을 미국 주식 심볼로 변환
  getUSSymbol(koreanSymbol: string): string {
    const symbolMap: Record<string, string> = {
      'AAPL': 'AAPL',    // 애플
      'TSLA': 'TSLA',    // 테슬라
      'GOOGL': 'GOOGL',  // 구글
      'MSFT': 'MSFT',    // 마이크로소프트
      'AMZN': 'AMZN',    // 아마존
      'NVDA': 'NVDA'     // 엔비디아
    };
    
    return symbolMap[koreanSymbol] || koreanSymbol;
  }
}

export const realStockService = new RealStockService();
