// Netlify 서버리스 함수 - Express 앱을 Netlify 환경에 맞게 래핑
const { handler } = require('../../dist/index.js');

exports.handler = handler;
