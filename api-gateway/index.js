const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Middleware untuk logging
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Proxy untuk microservices
app.use('/auth', createProxyMiddleware({ target: process.env.AUTH_URL, changeOrigin: true }));
app.use('/products', createProxyMiddleware({ target: process.env.PRODUCT_URL, changeOrigin: true }));
app.use('/orders', createProxyMiddleware({ target: process.env.ORDER_URL, changeOrigin: true }));

// Mendapatkan status server apakah berjalan
app.get('/health', (req, res) =>
    res.json({ status: 'UP', timestamp: new Date().toISOString() })
);

// Menjalankan server
app.listen(process.env.PORT, () =>
    console.log('API Gateway jalan di port', process.env.PORT)
);