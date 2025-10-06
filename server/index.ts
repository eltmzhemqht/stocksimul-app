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

// Netlify 서버리스 함수로 export
export const handler = async (event, context) => {
  // Netlify의 event/context를 Express req/res로 변환
  const req = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body,
    query: event.queryStringParameters || {},
  };

  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    status: (code) => {
      res.statusCode = code;
      return res;
    },
    json: (data) => {
      res.headers['Content-Type'] = 'application/json';
      res.body = JSON.stringify(data);
      return res;
    },
    send: (data) => {
      res.body = data;
      return res;
    },
    setHeader: (name, value) => {
      res.headers[name] = value;
    },
  };

  // Express 앱으로 요청 처리
  return new Promise((resolve) => {
    app(req, res);
    resolve({
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    });
  });
};

// 로컬 개발 환경에서만 서버 시작
if (process.env.NODE_ENV !== 'production') {
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3000 for local development.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
    
    // 주가 업데이터 시작
    priceUpdater.start();
  });
}
