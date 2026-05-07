const express = require('express');
const amqplib = require('amqplib');
const pool = require('./db');
const { authenticate } = require('./middleware');
require('dotenv').config();

const app = express();
app.use(express.json());

// Kirim pesan ke RabbitMQ
async function publish(data) {
    // Kirim pesan ke RabbitMQ
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    // Membuat channel
    const ch = await conn.createChannel();
    // Membuat queue
    await ch.assertQueue('order_created', { durable: true });
    // Kirim pesan
    ch.sendToQueue('order_created', Buffer.from(JSON.stringify(data)), { persistent: true });
    // Tutup koneksi
    setTimeout(() => conn.close(), 300);
}

// Menambahkan pesanan
app.post('/orders', authenticate, async (req, res) => {
    const { product_id, quantity } = req.body;
    // product_id dan quantity wajib diisi
    if (!product_id || !quantity || quantity <= 0)
        return res.status(400).json({ message: 'product_id dan quantity wajib diisi' });
  
    try {
        const [produk] = await pool.query('SELECT * FROM products WHERE id=?', [product_id]);
        // produk tidak ditemukan
        if (produk.length === 0)
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
    
        const p = produk[0];
        // stok tidak mencukupi
        if (p.stock < quantity)
            return res.status(400).json({ message: 'Stok tidak mencukupi' });
    
        // Membuat pesanan
        const total = p.price * quantity;
        await pool.query('UPDATE products SET stock=stock-? WHERE id=?', [quantity, product_id]);
        const [result] = await pool.query( 'INSERT INTO orders (user_id,product_id,quantity,total_price) VALUES (?,?,?,?)', [req.user.id, product_id, quantity, total]);
    
        // Kirim pesan
        await publish({
            orderId: result.insertId,
            userId: req.user.id,
            userName: req.user.name,
            productName: p.name,
            quantity,
            total
        });

    res.status(201).json({message: 'Order berhasil dibuat', data: { id: result.insertId, product_id, quantity, total_price: total, status: 'pending' }});
  
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mendapatkan semua pesanan
app.get('/orders', authenticate, async (req, res) => {
    let rows;
    // admin dapat melihat semua pesanan
    if (req.user.role === 'admin') {
        [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    } else {
        [rows] = await pool.query( 'SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC', [req.user.id]);
    }
  
    res.json({ data: rows });
});

// Menjalankan server
app.listen(process.env.PORT, () =>
    console.log('Order Service jalan di port', process.env.PORT)
);