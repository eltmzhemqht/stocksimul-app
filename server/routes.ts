import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { HoldingWithStock, PortfolioStats, TransactionWithStock } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("user-1");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getAllStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stocks/:id", async (req, res) => {
    try {
      const stock = await storage.getStock(req.params.id);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
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
      const holdings = await storage.getHoldings("user-1");
      const holdingsWithStock: HoldingWithStock[] = await Promise.all(
        holdings.map(async (holding) => {
          const stock = await storage.getStock(holding.stockId);
          if (!stock) {
            throw new Error("Stock not found");
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
        })
      );
      res.json(holdingsWithStock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions("user-1");
      const transactionsWithStock: TransactionWithStock[] = await Promise.all(
        transactions.map(async (transaction) => {
          const stock = await storage.getStock(transaction.stockId);
          if (!stock) {
            throw new Error("Stock not found");
          }
          return {
            ...transaction,
            stock,
          };
        })
      );
      res.json(transactionsWithStock);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/portfolio/stats", async (req, res) => {
    try {
      const user = await storage.getUser("user-1");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const INITIAL_BALANCE = 10000000;
      const holdings = await storage.getHoldings("user-1");
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
      const allHistory = Array.from(storage["priceHistory"].values());
      
      const grouped = allHistory.reduce((acc, item) => {
        const date = new Date(item.timestamp).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {} as Record<string, typeof allHistory>);

      const portfolioHistory = Object.entries(grouped).map(([date, items]) => {
        const avgPrice = items.reduce((sum, item) => sum + Number(item.price), 0) / items.length;
        return {
          id: items[0].id,
          stockId: "portfolio",
          price: avgPrice.toFixed(2),
          timestamp: new Date(date),
        };
      });

      portfolioHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      res.json(portfolioHistory);
    } catch (error) {
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

      const user = await storage.getUser("user-1");
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

        await storage.updateUserBalance("user-1", userBalance - totalCost);

        const existingHolding = await storage.getHolding("user-1", stockId);
        if (existingHolding) {
          const newQuantity = existingHolding.quantity + quantity;
          const newAveragePrice =
            (Number(existingHolding.averagePrice) * existingHolding.quantity + totalCost) / newQuantity;
          await storage.updateHolding(existingHolding.id, newQuantity, newAveragePrice);
        } else {
          await storage.createHolding({
            userId: "user-1",
            stockId,
            quantity,
            averagePrice: currentPrice.toFixed(2),
          });
        }

        await storage.createTransaction({
          userId: "user-1",
          stockId,
          type: "buy",
          quantity,
          price: currentPrice.toFixed(2),
          total: totalCost.toFixed(2),
        });

        res.json({ message: "Purchase successful" });
      } else if (type === "sell") {
        const existingHolding = await storage.getHolding("user-1", stockId);
        if (!existingHolding) {
          return res.status(400).json({ message: "You don't own this stock" });
        }

        if (existingHolding.quantity < quantity) {
          return res.status(400).json({ message: "Insufficient shares" });
        }

        await storage.updateUserBalance("user-1", userBalance + totalCost);

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
          userId: "user-1",
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

  const httpServer = createServer(app);

  return httpServer;
}
