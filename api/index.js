// Vercel 서버리스 함수 - Express 앱을 Vercel 환경에 맞게 래핑
import app from '../dist/index.js';

export default async (req, res) => {
  // Vercel의 req/res를 Express 형식으로 변환
  const expressReq = {
    ...req,
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const expressRes = {
    ...res,
    status: (code) => {
      res.statusCode = code;
      return expressRes;
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    send: (data) => {
      res.end(data);
    },
    setHeader: (name, value) => {
      res.setHeader(name, value);
    },
  };

  // Express 앱으로 요청 처리
  return new Promise((resolve, reject) => {
    try {
      app(expressReq, expressRes);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
