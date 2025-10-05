import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { priceUpdater } from "./priceUpdater";
import { newsService } from "./newsService";
import { cache } from "./cache";
import type { HoldingWithStock, PortfolioStats, TransactionWithStock } from "@shared/schema";

// 간단한 사용자 인증 미들웨어
function getCurrentUserId(req: any): string {
  // 클라이언트에서 전달된 userId 헤더를 우선 사용
  const clientUserId = req.headers['x-user-id'] as string;
  if (clientUserId) {
    req.session = req.session || {};
    req.session.userId = clientUserId;
    return clientUserId;
  }
  
  // 세션에서 사용자 ID를 가져오거나, 기본값으로 랜덤 ID 생성
  if (!req.session?.userId) {
    req.session = req.session || {};
    req.session.userId = `user-${Math.random().toString(36).substr(2, 9)}`;
  }
  return req.session.userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/user", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      let user = await storage.getUser(userId);
      
      // 사용자가 없으면 새로 생성
      if (!user) {
        user = await storage.createUser({
          id: userId, // 세션의 userId를 사용
          username: `user-${userId.slice(-6)}`,
          password: "demo",
          balance: "10000000.00"
        });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stocks", async (req, res) => {
    try {
      const cacheKey = "stocks:all";
      let stocks = cache.get(cacheKey);
      
      if (!stocks) {
        stocks = await storage.getAllStocks();
        cache.set(cacheKey, stocks, 2 * 60 * 1000); // 2분 캐시
      }
      
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const cacheKey = `stocks:${req.params.id}`;
      let stock = cache.get(cacheKey);
      
      if (!stock) {
        stock = await storage.getStock(req.params.id);
        if (!stock) {
          return res.status(404).json({ message: "Stock not found" });
        }
        cache.set(cacheKey, stock, 2 * 60 * 1000); // 2분 캐시
      }
      
      res.json(stock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stocks/:id/history", async (req, res) => {
    try {
      const history = await storage.getPriceHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/holdings", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const holdings = await storage.getHoldings(userId);
      
      if (holdings.length === 0) {
        return res.json([]);
      }

      // 모든 주식 정보를 한 번에 가져오기
      const allStocks = await storage.getAllStocks();
      const stockMap = new Map(allStocks.map(stock => [stock.id, stock]));
      
      const holdingsWithStock: HoldingWithStock[] = holdings.map((holding) => {
        const stock = stockMap.get(holding.stockId);
        if (!stock) {
          throw new Error(`Stock not found: ${holding.stockId}`);
        }
        
        const currentPrice = Number(stock.currentPrice);
        const averagePrice = Number(holding.averagePrice);
        const currentValue = currentPrice * holding.quantity;
        const profitLoss = (currentPrice - averagePrice) * holding.quantity;
        const profitLossPercent = ((currentPrice - averagePrice) / averagePrice) * 100;

        return {
          ...holding,
          stock,
          currentValue,
          profitLoss,
          profitLossPercent,
        };
      });
      
      res.json(holdingsWithStock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const transactions = await storage.getTransactions(userId);
      
      if (transactions.length === 0) {
        return res.json([]);
      }

      // 모든 주식 정보를 한 번에 가져오기
      const allStocks = await storage.getAllStocks();
      const stockMap = new Map(allStocks.map(stock => [stock.id, stock]));
      
      const transactionsWithStock: TransactionWithStock[] = transactions.map((transaction) => {
        const stock = stockMap.get(transaction.stockId);
        if (!stock) {
          throw new Error(`Stock not found: ${transaction.stockId}`);
        }
        return {
          ...transaction,
          stock,
        };
      });
      
      res.json(transactionsWithStock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/portfolio/stats", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const INITIAL_BALANCE = 10000000;
      const holdings = await storage.getHoldings(userId);
      const cashBalance = Number(user.balance);
      
      let holdingsValue = 0;
      let totalCost = 0;

      for (const holding of holdings) {
        const stock = await storage.getStock(holding.stockId);
        if (stock) {
          const currentPrice = Number(stock.currentPrice);
          const averagePrice = Number(holding.averagePrice);
          holdingsValue += currentPrice * holding.quantity;
          totalCost += averagePrice * holding.quantity;
        }
      }

      const totalValue = cashBalance + holdingsValue;
      const totalProfitLoss = totalValue - INITIAL_BALANCE;
      const totalProfitLossPercent = INITIAL_BALANCE > 0 ? (totalProfitLoss / INITIAL_BALANCE) * 100 : 0;

      const stats: PortfolioStats = {
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent,
        cashBalance,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/portfolio/history", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const INITIAL_BALANCE = 10000000;
      const transactions = await storage.getTransactions(userId);
      
      // 포트폴리오 히스토리 생성
      const portfolioHistory = [];
      
      // 거래가 없는 경우 오늘 날짜로 초기 가치 반환
      if (transactions.length === 0) {
        const today = new Date();
        portfolioHistory.push({
          id: `portfolio-${today.getTime()}`,
          stockId: "portfolio",
          price: INITIAL_BALANCE.toFixed(2),
          timestamp: today,
        });
        
        res.json(portfolioHistory);
        return;
      }

      // 거래 날짜들을 수집하고 정렬
      const transactionDates = transactions.map(t => new Date(t.createdAt)).sort((a, b) => a.getTime() - b.getTime());
      
      // 오늘 날짜도 추가 (거래가 있다면)
      const today = new Date();
      if (transactionDates.length === 0 || transactionDates[transactionDates.length - 1].toDateString() !== today.toDateString()) {
        transactionDates.push(today);
      }

      // 각 날짜에 대해 포트폴리오 가치 계산
      for (const date of transactionDates) {
        // 해당 날짜까지의 모든 거래를 고려하여 포트폴리오 가치 계산
        const holdings = await storage.getHoldings(userId);
        const cashBalance = Number(user.balance);
        
        let holdingsValue = 0;
        for (const holding of holdings) {
          const stock = await storage.getStock(holding.stockId);
          if (stock) {
            // 해당 날짜의 주가를 찾기 (가장 가까운 과거 가격 사용)
            const priceHistory = await storage.getPriceHistory(holding.stockId);
            const closestPrice = priceHistory
              .filter(h => new Date(h.timestamp) <= date)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            
            const currentPrice = closestPrice ? Number(closestPrice.price) : Number(stock.currentPrice);
            holdingsValue += currentPrice * holding.quantity;
          }
        }
        
        const totalValue = cashBalance + holdingsValue;
        
        portfolioHistory.push({
          id: `portfolio-${date.getTime()}`,
          stockId: "portfolio",
          price: totalValue.toFixed(2),
          timestamp: date,
        });
      }

      res.json(portfolioHistory);
    } catch (error) {
      console.error('Portfolio history error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/trade", async (req, res) => {
    try {
      const { stockId, quantity, type } = req.body;

      if (!stockId || !quantity || !type) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than 0" });
      }

      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      const stock = await storage.getStock(stockId);

      if (!user || !stock) {
        return res.status(404).json({ message: "User or stock not found" });
      }

      const currentPrice = Number(stock.currentPrice);
      const totalCost = currentPrice * quantity;
      const userBalance = Number(user.balance);

      if (type === "buy") {
        if (userBalance < totalCost) {
          return res.status(400).json({ message: "Insufficient balance" });
        }

        await storage.updateUserBalance(userId, userBalance - totalCost);

        const existingHolding = await storage.getHolding(userId, stockId);
        if (existingHolding) {
          const newQuantity = existingHolding.quantity + quantity;
          const newAveragePrice =
            (Number(existingHolding.averagePrice) * existingHolding.quantity + totalCost) / newQuantity;
          await storage.updateHolding(existingHolding.id, newQuantity, newAveragePrice);
        } else {
          await storage.createHolding({
            userId: userId,
            stockId,
            quantity,
            averagePrice: currentPrice.toFixed(2),
          });
        }

        await storage.createTransaction({
          userId: userId,
          stockId,
          type: "buy",
          quantity,
          price: currentPrice.toFixed(2),
          total: totalCost.toFixed(2),
        });

        res.json({ message: "Purchase successful" });
      } else if (type === "sell") {
        const existingHolding = await storage.getHolding(userId, stockId);
        if (!existingHolding) {
          return res.status(400).json({ message: "You don't own this stock" });
        }

        if (existingHolding.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient shares" });
        }

        await storage.updateUserBalance(userId, userBalance + totalCost);

        if (existingHolding.quantity === quantity) {
          await storage.deleteHolding(existingHolding.id);
        } else {
          await storage.updateHolding(
            existingHolding.id,
            existingHolding.quantity - quantity,
            Number(existingHolding.averagePrice)
          );
        }

        await storage.createTransaction({
          userId: userId,
          stockId,
          type: "sell",
          quantity,
          price: currentPrice.toFixed(2),
          total: totalCost.toFixed(2),
        });

        res.json({ message: "Sale successful" });
      } else {
        return res.status(400).json({ message: "Invalid transaction type" });
      }
    } catch (error) {
      console.error("Trade error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 수동 주가 업데이트 API (테스트용)
  app.post("/api/update-prices", async (req, res) => {
    try {
      await priceUpdater.updatePricesNow();
      res.json({ message: "Prices updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update prices" });
    }
  });

  // 뉴스 피드 API (전체 뉴스)
  app.get("/api/news", async (req, res) => {
    try {
      const news = await newsService.getLatestNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // 특정 종목 뉴스 API
  app.get("/api/news/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const news = await newsService.getLatestNews(symbol);
      res.json(news);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // 특정 종목의 뉴스 영향도 API
  app.get("/api/news/impact/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const impact = newsService.calculateNewsImpact(symbol);
      res.json({ symbol, impact, impactPercent: (impact * 100).toFixed(2) });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate news impact" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
