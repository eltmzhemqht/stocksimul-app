import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { priceUpdater } from "./priceUpdater";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 세션 미들웨어 설정
const sessionStore = new (MemoryStore(session))({
  checkPeriod: 86400000, // 24시간마다 만료된 세션 정리
});

app.use(session({
  store: sessionStore,
  secret: 'stocksimul-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // HTTPS가 아닌 환경에서는 false
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7일로 연장
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Vercel 서버리스 함수로 작동하도록 수정
const server = await registerRoutes(app);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

// importantly only setup vite in development and after
// setting up all the other routes so the catch-all route
// doesn't interfere with the other routes
if (app.get("env") === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

// Vercel에서는 서버를 직접 시작하지 않음
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 8080 for Fly.io, 5000 for others.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '8080', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    
    // 주가 업데이터 시작
    priceUpdater.start();
  });
}

// Vercel 서버리스 함수로 export
export default app;
