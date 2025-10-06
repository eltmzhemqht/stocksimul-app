const { createServer } = require('http');
const { parse } = require('url');

// Import the built Express app
const app = require('../dist/index.js');

module.exports = (req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;

  // Set the request URL for Express
  req.url = pathname;
  req.query = query;

  // Handle the request with Express
  app(req, res);
};
