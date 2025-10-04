import { log } from "./vite";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number; // -1 to 1
  timestamp: Date;
  symbols: string[];
}

export class NewsService {
  private newsCache: NewsItem[] = [];
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10분 캐시
  private lastUpdate = 0;

  constructor() {
    this.initializeMockNews();
  }

  private initializeMockNews() {
    // 모의 뉴스 데이터 생성
    const mockNews: Omit<NewsItem, 'id' | 'timestamp'>[] = [
      {
        title: "애플, 새로운 AI 기능 발표로 주가 상승 기대",
        summary: "애플이 차세대 AI 기능을 발표하며 시장의 관심을 끌고 있습니다.",
        sentiment: 'positive',
        impact: 0.3,
        symbols: ['AAPL']
      },
      {
        title: "테슬라, 중국 시장에서 판매량 급증",
        summary: "테슬라가 중국 시장에서 전월 대비 20% 판매량 증가를 기록했습니다.",
        sentiment: 'positive',
        impact: 0.4,
        symbols: ['TSLA']
      },
      {
        title: "구글, 클라우드 사업부 실적 부진으로 우려",
        summary: "구글의 클라우드 사업부 실적이 시장 기대치에 못 미쳤습니다.",
        sentiment: 'negative',
        impact: -0.2,
        symbols: ['GOOGL']
      },
      {
        title: "마이크로소프트, AI 투자 확대로 주가 상승",
        summary: "마이크로소프트가 AI 분야에 대규모 투자를 발표했습니다.",
        sentiment: 'positive',
        impact: 0.25,
        symbols: ['MSFT']
      },
      {
        title: "아마존, 전자상거래 시장 점유율 확대",
        summary: "아마존이 전자상거래 시장에서 점유율을 확대하고 있습니다.",
        sentiment: 'positive',
        impact: 0.15,
        symbols: ['AMZN']
      },
      {
        title: "엔비디아, 반도체 수요 감소 우려",
        summary: "반도체 수요 감소로 엔비디아 주가에 부정적 영향을 미칠 수 있습니다.",
        sentiment: 'negative',
        impact: -0.3,
        symbols: ['NVDA']
      }
    ];

    this.newsCache = mockNews.map((news, index) => ({
      ...news,
      id: `news-${index + 1}`,
      timestamp: new Date(Date.now() - (index * 2 + Math.random() * 2) * 60 * 60 * 1000) // 최근 24시간 내, 시간순으로 배치
    }));
  }

  async getLatestNews(symbol?: string): Promise<NewsItem[]> {
    // 캐시 업데이트 확인
    if (Date.now() - this.lastUpdate > this.CACHE_DURATION) {
      await this.updateNews();
    }

    let filteredNews = symbol 
      ? this.newsCache.filter(news => news.symbols.includes(symbol))
      : this.newsCache;

    // 시간순으로 정렬 (최신순)
    return filteredNews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private async updateNews(): Promise<void> {
    // 실제 구현에서는 NewsAPI나 다른 뉴스 API를 호출
    // 현재는 모의 데이터를 주기적으로 업데이트
    
    // 랜덤하게 새로운 뉴스 추가
    if (Math.random() < 0.3) { // 30% 확률로 새 뉴스 추가
      const newNews: NewsItem = {
        id: `news-${Date.now()}`,
        title: this.generateRandomNewsTitle(),
        summary: this.generateRandomNewsSummary(),
        sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        impact: (Math.random() - 0.5) * 0.6, // -0.3 to 0.3
        timestamp: new Date(),
        symbols: [this.getRandomSymbol()]
      };

      this.newsCache.unshift(newNews);
      
      // 최대 20개 뉴스만 유지하고, 오래된 뉴스는 정리
      if (this.newsCache.length > 20) {
        // 시간순으로 정렬 후 최신 20개만 유지
        this.newsCache = this.newsCache
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 20);
      }
      
      // 24시간 이상 된 뉴스는 자동으로 제거
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      this.newsCache = this.newsCache.filter(news => 
        new Date(news.timestamp).getTime() > oneDayAgo
      );

      log(`📰 New news: ${newNews.title} (${newNews.sentiment})`);
    }

    this.lastUpdate = Date.now();
  }

  private generateRandomNewsTitle(): string {
    const titles = [
      "기업 실적 발표로 주가 변동 예상",
      "새로운 제품 출시로 시장 관심 집중",
      "경쟁사 대비 우위 확보",
      "시장 불안정으로 주가 하락 우려",
      "정부 정책 변화로 업계 영향 예상"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateRandomNewsSummary(): string {
    return "시장 분석가들은 해당 소식이 주가에 영향을 미칠 것으로 예상한다고 밝혔습니다.";
  }

  private getRandomSymbol(): string {
    const symbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'NVDA'];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  // 뉴스 감정 분석을 통한 주가 영향도 계산
  calculateNewsImpact(symbol: string): number {
    const relevantNews = this.newsCache.filter(news => 
      news.symbols.includes(symbol) && 
      Date.now() - news.timestamp.getTime() < 24 * 60 * 60 * 1000 // 최근 24시간
    );

    if (relevantNews.length === 0) return 0;

    const totalImpact = relevantNews.reduce((sum, news) => sum + news.impact, 0);
    const averageImpact = totalImpact / relevantNews.length;

    // 최대 ±5% 영향으로 제한
    return Math.max(-0.05, Math.min(0.05, averageImpact));
  }
}

export const newsService = new NewsService();
