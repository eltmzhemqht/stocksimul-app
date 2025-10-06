// Vercel 서버리스 함수
const { createServer } = require('http');

// Express 앱을 import
const app = require('../dist/index.js');

module.exports = app;
