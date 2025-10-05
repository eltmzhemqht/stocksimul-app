import {
  type User,
  type InsertUser,
  type Stock,
  type InsertStock,
  type Holding,
  type InsertHolding,
  type Transaction,
  type InsertTransaction,
  type PriceHistory,
  type InsertPriceHistory,
  type PortfolioStats,
  type HoldingWithStock,
  type TransactionWithStock,
  users,
  stocks,
  holdings,
  transactions,
  priceHistory,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";
import { promises as fs } from "fs";
import { join } from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, balance: number): Promise<void>;

  getAllStocks(): Promise<Stock[]>;
  getStock(id: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStockPrice(id: string, currentPrice: number, previousClose: number): Promise<void>;

  getHoldings(userId: string): Promise<Holding[]>;
  getHolding(userId: string, stockId: string): Promise<Holding | undefined>;
  createHolding(holding: InsertHolding): Promise<Holding>;
  updateHolding(id: string, quantity: number, averagePrice: number): Promise<void>;
  deleteHolding(id: string): Promise<void>;

  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  getPriceHistory(stockId: string): Promise<PriceHistory[]>;
  createPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
}

export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
    
    this.initializeMockData();
  }

  private async initializeMockData() {
    try {
      // 기본 사용자 생성
      const defaultUser: InsertUser = {
        id: "user-1",
        username: "demo",
        password: "demo",
        balance: "10000000.00",
      };
      
      const existingUser = await this.getUser(defaultUser.id);
      if (!existingUser) {
        await this.createUser(defaultUser);
      }

      // 주식 데이터 생성
      const mockStocks: InsertStock[] = [
        {
          symbol: "AAPL",
          name: "애플",
          currentPrice: "175000.00",
          previousClose: "173500.00",
        },
        {
          symbol: "TSLA",
          name: "테슬라",
          currentPrice: "245000.00",
          previousClose: "248000.00",
        },
        {
          symbol: "GOOGL",
          name: "구글",
          currentPrice: "142000.00",
          previousClose: "140000.00",
        },
        {
          symbol: "MSFT",
          name: "마이크로소프트",
          currentPrice: "378000.00",
          previousClose: "375000.00",
        },
        {
          symbol: "AMZN",
          name: "아마존",
          currentPrice: "156000.00",
          previousClose: "158000.00",
        },
        {
          symbol: "NVDA",
          name: "엔비디아",
          currentPrice: "485000.00",
          previousClose: "478000.00",
        },
      ];

      for (const stockData of mockStocks) {
        const existingStock = await this.getStockBySymbol(stockData.symbol);
        if (!existingStock) {
          const stock = await this.createStock(stockData);
          
          // 가격 히스토리 생성
          const now = new Date();
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const basePrice = Number(stock.currentPrice);
            const variance = (Math.random() - 0.5) * basePrice * 0.1;
            const price = basePrice + variance;

            await this.createPriceHistory({
              stockId: stock.id,
              price: price.toFixed(2),
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize mock data:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = insertUser.id || randomUUID();
    const userData = { ...insertUser, id, balance: "10000000.00" };
    await this.db.insert(users).values(userData);
    return userData as User;
  }

  async updateUserBalance(userId: string, balance: number): Promise<void> {
    await this.db.update(users).set({ balance: balance.toFixed(2) }).where(eq(users.id, userId));
  }

  async getAllStocks(): Promise<Stock[]> {
    return await this.db.select().from(stocks);
  }

  async getStock(id: string): Promise<Stock | undefined> {
    const result = await this.db.select().from(stocks).where(eq(stocks.id, id)).limit(1);
    return result[0];
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const result = await this.db.select().from(stocks).where(eq(stocks.symbol, symbol)).limit(1);
    return result[0];
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = randomUUID();
    const stockData = { id, ...insertStock };
    await this.db.insert(stocks).values(stockData);
    return stockData as Stock;
  }

  async updateStockPrice(id: string, currentPrice: number, previousClose: number): Promise<void> {
    await this.db.update(stocks)
      .set({ 
        currentPrice: currentPrice.toFixed(2), 
        previousClose: previousClose.toFixed(2) 
      })
      .where(eq(stocks.id, id));
  }

  async getHoldings(userId: string): Promise<Holding[]> {
    return await this.db.select().from(holdings).where(eq(holdings.userId, userId));
  }

  async getHolding(userId: string, stockId: string): Promise<Holding | undefined> {
    const result = await this.db.select()
      .from(holdings)
      .where(and(eq(holdings.userId, userId), eq(holdings.stockId, stockId)))
      .limit(1);
    return result[0];
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    const id = randomUUID();
    const holdingData = { id, ...insertHolding };
    await this.db.insert(holdings).values(holdingData);
    return holdingData as Holding;
  }

  async updateHolding(id: string, quantity: number, averagePrice: number): Promise<void> {
    await this.db.update(holdings)
      .set({ 
        quantity, 
        averagePrice: averagePrice.toFixed(2) 
      })
      .where(eq(holdings.id, id));
  }

  async deleteHolding(id: string): Promise<void> {
    await this.db.delete(holdings).where(eq(holdings.id, id));
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return await this.db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transactionData = {
      id,
      ...insertTransaction,
      createdAt: new Date(),
    };
    await this.db.insert(transactions).values(transactionData);
    return transactionData as Transaction;
  }

  async getPriceHistory(stockId: string): Promise<PriceHistory[]> {
    return await this.db.select()
      .from(priceHistory)
      .where(eq(priceHistory.stockId, stockId))
      .orderBy(priceHistory.timestamp);
  }

  async createPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    const id = randomUUID();
    const historyData = {
      id,
      ...insertHistory,
      timestamp: new Date(),
    };
    await this.db.insert(priceHistory).values(historyData);
    
    // 데이터베이스 최적화: 각 주식당 최대 100개의 가격 히스토리만 유지
    const stockHistories = await this.db.select()
      .from(priceHistory)
      .where(eq(priceHistory.stockId, insertHistory.stockId))
      .orderBy(desc(priceHistory.timestamp));
    
    if (stockHistories.length > 100) {
      const toDelete = stockHistories.slice(100);
      for (const history of toDelete) {
        await this.db.delete(priceHistory).where(eq(priceHistory.id, history.id));
      }
    }
    
    return historyData as PriceHistory;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stocks: Map<string, Stock>;
  private holdings: Map<string, Holding>;
  private transactions: Map<string, Transaction>;
  private priceHistory: Map<string, PriceHistory>;
  private dataDir: string;
  private initialized: boolean = false;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.holdings = new Map();
    this.transactions = new Map();
    this.priceHistory = new Map();
    this.dataDir = join(process.cwd(), 'data');

    // 비동기 초기화를 즉시 실행 (에러 처리 개선)
    this.initializeData().catch((error) => {
      console.error('Storage initialization failed:', error);
      // 초기화 실패 시에도 기본 데이터로 계속 진행
      this.initializeMockData();
    });
  }

  private async initializeData() {
    if (this.initialized) return;
    
    // 데이터 디렉토리 생성
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.log('Data directory already exists or creation failed:', error);
    }

    // 저장된 데이터 로드 시도
    await this.loadData();
    
    // 데이터가 없으면 초기 데이터 생성
    if (this.users.size === 0) {
      this.initializeMockData();
      await this.saveData();
    }
    
    this.initialized = true;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeData();
    }
  }

  private async loadData() {
    try {
      const dataFiles = {
        users: join(this.dataDir, 'users.json'),
        stocks: join(this.dataDir, 'stocks.json'),
        holdings: join(this.dataDir, 'holdings.json'),
        transactions: join(this.dataDir, 'transactions.json'),
        priceHistory: join(this.dataDir, 'priceHistory.json'),
      };

      // 각 데이터 파일 로드
      for (const [key, filePath] of Object.entries(dataFiles)) {
        try {
          const data = await fs.readFile(filePath, 'utf-8');
          const parsedData = JSON.parse(data);
          
          switch (key) {
            case 'users':
              this.users = new Map(Object.entries(parsedData));
              break;
            case 'stocks':
              this.stocks = new Map(Object.entries(parsedData));
              break;
            case 'holdings':
              this.holdings = new Map(Object.entries(parsedData));
              break;
            case 'transactions':
              this.transactions = new Map(Object.entries(parsedData));
              break;
            case 'priceHistory':
              this.priceHistory = new Map(Object.entries(parsedData));
              break;
          }
        } catch (error) {
          console.log(`Failed to load ${key} data:`, error);
        }
      }
    } catch (error) {
      console.log('Failed to load data:', error);
    }
  }

  private async saveData() {
    try {
      const dataFiles = {
        users: join(this.dataDir, 'users.json'),
        stocks: join(this.dataDir, 'stocks.json'),
        holdings: join(this.dataDir, 'holdings.json'),
        transactions: join(this.dataDir, 'transactions.json'),
        priceHistory: join(this.dataDir, 'priceHistory.json'),
      };

      // 각 데이터 파일 저장
      await Promise.all([
        fs.writeFile(dataFiles.users, JSON.stringify(Object.fromEntries(this.users))),
        fs.writeFile(dataFiles.stocks, JSON.stringify(Object.fromEntries(this.stocks))),
        fs.writeFile(dataFiles.holdings, JSON.stringify(Object.fromEntries(this.holdings))),
        fs.writeFile(dataFiles.transactions, JSON.stringify(Object.fromEntries(this.transactions))),
        fs.writeFile(dataFiles.priceHistory, JSON.stringify(Object.fromEntries(this.priceHistory))),
      ]);
    } catch (error) {
      console.log('Failed to save data:', error);
    }
  }

  private initializeMockData() {
    const defaultUser: User = {
      id: "user-1",
      username: "demo",
      password: "demo",
      balance: "10000000.00",
    };
    this.users.set(defaultUser.id, defaultUser);

    const mockStocks: Stock[] = [
      {
        id: "stock-1",
        symbol: "AAPL",
        name: "애플",
        currentPrice: "175000.00",
        previousClose: "173500.00",
      },
      {
        id: "stock-2",
        symbol: "TSLA",
        name: "테슬라",
        currentPrice: "245000.00",
        previousClose: "248000.00",
      },
      {
        id: "stock-3",
        symbol: "GOOGL",
        name: "구글",
        currentPrice: "142000.00",
        previousClose: "140000.00",
      },
      {
        id: "stock-4",
        symbol: "MSFT",
        name: "마이크로소프트",
        currentPrice: "378000.00",
        previousClose: "375000.00",
      },
      {
        id: "stock-5",
        symbol: "AMZN",
        name: "아마존",
        currentPrice: "156000.00",
        previousClose: "158000.00",
      },
      {
        id: "stock-6",
        symbol: "NVDA",
        name: "엔비디아",
        currentPrice: "485000.00",
        previousClose: "478000.00",
      },
    ];

    mockStocks.forEach((stock) => this.stocks.set(stock.id, stock));

    const now = new Date();
    mockStocks.forEach((stock) => {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const basePrice = Number(stock.currentPrice);
        const variance = (Math.random() - 0.5) * basePrice * 0.1;
        const price = basePrice + variance;

        const history: PriceHistory = {
          id: randomUUID(),
          stockId: stock.id,
          price: price.toFixed(2),
          timestamp: date,
        };
        this.priceHistory.set(history.id, history);
      }
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    await this.ensureInitialized();
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    const id = insertUser.id || randomUUID();
    const user: User = { ...insertUser, id, balance: "10000000.00" };
    this.users.set(id, user);
    await this.saveData();
    return user;
  }

  async updateUserBalance(userId: string, balance: number): Promise<void> {
    await this.ensureInitialized();
    const user = this.users.get(userId);
    if (user) {
      user.balance = balance.toFixed(2);
      this.users.set(userId, user);
      await this.saveData();
    }
  }

  async getAllStocks(): Promise<Stock[]> {
    await this.ensureInitialized();
    return Array.from(this.stocks.values());
  }

  async getStock(id: string): Promise<Stock | undefined> {
    await this.ensureInitialized();
    return this.stocks.get(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    await this.ensureInitialized();
    return Array.from(this.stocks.values()).find(stock => stock.symbol === symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    await this.ensureInitialized();
    const id = randomUUID();
    const stock: Stock = { id, ...insertStock };
    this.stocks.set(id, stock);
    await this.saveData();
    return stock;
  }

  async updateStockPrice(id: string, currentPrice: number, previousClose: number): Promise<void> {
    await this.ensureInitialized();
    const stock = this.stocks.get(id);
    if (stock) {
      stock.currentPrice = currentPrice.toFixed(2);
      stock.previousClose = previousClose.toFixed(2);
      this.stocks.set(id, stock);
      await this.saveData();
    }
  }

  async getHoldings(userId: string): Promise<Holding[]> {
    await this.ensureInitialized();
    return Array.from(this.holdings.values()).filter((h) => h.userId === userId);
  }

  async getHolding(userId: string, stockId: string): Promise<Holding | undefined> {
    await this.ensureInitialized();
    return Array.from(this.holdings.values()).find(
      (h) => h.userId === userId && h.stockId === stockId
    );
  }

  async createHolding(insertHolding: InsertHolding): Promise<Holding> {
    await this.ensureInitialized();
    const id = randomUUID();
    const holding: Holding = { id, ...insertHolding };
    this.holdings.set(id, holding);
    await this.saveData();
    return holding;
  }

  async updateHolding(id: string, quantity: number, averagePrice: number): Promise<void> {
    await this.ensureInitialized();
    const holding = this.holdings.get(id);
    if (holding) {
      holding.quantity = quantity;
      holding.averagePrice = averagePrice.toFixed(2);
      this.holdings.set(id, holding);
      await this.saveData();
    }
  }

  async deleteHolding(id: string): Promise<void> {
    await this.ensureInitialized();
    this.holdings.delete(id);
    await this.saveData();
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    await this.ensureInitialized();
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    await this.ensureInitialized();
    const id = randomUUID();
    const transaction: Transaction = {
      id,
      ...insertTransaction,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    await this.saveData();
    return transaction;
  }

  async getPriceHistory(stockId: string): Promise<PriceHistory[]> {
    await this.ensureInitialized();
    return Array.from(this.priceHistory.values())
      .filter((h) => h.stockId === stockId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createPriceHistory(insertHistory: InsertPriceHistory): Promise<PriceHistory> {
    await this.ensureInitialized();
    const id = randomUUID();
    const history: PriceHistory = {
      id,
      ...insertHistory,
      timestamp: new Date(),
    };
    this.priceHistory.set(id, history);
    
    // 메모리 최적화: 각 주식당 최대 100개의 가격 히스토리만 유지
    const stockHistories = Array.from(this.priceHistory.values())
      .filter(h => h.stockId === insertHistory.stockId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (stockHistories.length > 100) {
      const toDelete = stockHistories.slice(100);
      toDelete.forEach(h => this.priceHistory.delete(h.id));
    }
    
    await this.saveData();
    return history;
  }
}

// 환경 변수에 따라 저장소 선택
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
