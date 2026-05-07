const express = require('express');
const pool = require('./db');
const { authenticate, adminOnly } = require('./middleware');
require('dotenv').config();

const app = express();
app.use(express.json());

// Mendapatkan semua produk
app.get('/products', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ data: rows });
});

// Mendapatkan produk berdasarkan ID
app.get('/products/:id', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    // produk tidak ditemukan
    if (rows.length === 0)
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
    
    res.json({ data: rows[0] });
});

// Menambahkan produk
app.post('/products', authenticate, adminOnly, async (req, res) => {
    const { name, price, stock } = req.body;
    // name, price, stock wajib diisi
    if (!name || price === undefined || stock === undefined)
        return res.status(400).json({ message: 'name, price, stock wajib diisi' });
  
    // price dan stock tidak boleh negatif
    if (price < 0 || stock < 0)
        return res.status(400).json({ message: 'price dan stock tidak boleh negatif' });
  
    const [result] = await pool.query( 'INSERT INTO products (name,price,stock) VALUES (?,?,?)', [name, price, stock]);
    
    res.status(201).json({ message: 'Produk ditambahkan', data: { id: result.insertId, name, price, stock }});
});

// Mengupdate produk
app.put('/products/:id', authenticate, adminOnly, async (req, res) => {
    const { name, price, stock } = req.body;
    // name, price, stock wajib diisi
    if (!name || price === undefined || stock === undefined)
        return res.status(400).json({ message: 'name, price, stock wajib diisi' });
  
    const [result] = await pool.query( 'UPDATE products SET name=?, price=?, stock=? WHERE id=?', [name, price, stock, req.params.id]);

    // produk tidak ditemukan
    if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
  
    res.json({ message: 'Produk diupdate' });
});

// Menghapus produk
app.delete('/products/:id', authenticate, adminOnly, async (req, res) => {
    const [result] = await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
    // produk tidak ditemukan
    if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
  
    res.json({ message: 'Produk dihapus' });
});

// Menjalankan server
app.listen(process.env.PORT, () =>
    console.log('Product Service jalan di port', process.env.PORT)
);