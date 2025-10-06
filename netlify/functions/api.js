// Netlify Functions를 위한 간단한 API 핸들러
const { createServer } = require('http');
const { parse } = require('url');

// Express 앱을 import
const app = require('../../dist/index.js');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const { httpMethod, path, queryStringParameters, body, headers } = event;
    
    // Express 앱에 맞는 request 객체 생성
    const req = {
      method: httpMethod,
      url: path,
      query: queryStringParameters || {},
      headers: headers || {},
      body: body ? JSON.parse(body) : undefined,
      originalUrl: path,
    };

    // Express 앱에 맞는 response 객체 생성
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (name, value) => {
        res.headers[name] = value;
      },
      status: (code) => {
        res.statusCode = code;
        return res;
      },
      json: (data) => {
        res.body = JSON.stringify(data);
        res.headers['Content-Type'] = 'application/json';
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body,
        });
      },
      send: (data) => {
        res.body = data;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body,
        });
      },
    };

    // Express 앱으로 요청 처리
    app(req, res);
  });
};
