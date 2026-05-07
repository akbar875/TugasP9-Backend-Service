const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { authenticate } = require('./middleware');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'name, email, password wajib diisi' });
    
    try {
        const [cek] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
        if (cek.length > 0)
            return res.status(409).json({ message: 'Email sudah terdaftar' });
    
        const hash = await bcrypt.hash(password, 10);
        const userRole = role === 'admin' ? 'admin' : 'customer';
        const [result] = await pool.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name, email, hash, userRole]
        );
    
        res.status(201).json({ message: 'Registrasi berhasil', data: { id: result.insertId, name, email, role: userRole }});
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email dan password wajib diisi' });
  
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
        if (rows.length === 0)
            return res.status(401).json({ message: 'Email atau password salah' });
    
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
    
        if (!match)
            return res.status(401).json({ message: 'Email atau password salah' });
    
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' }
        );
        
        res.json({ message: 'Login berhasil', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(process.env.PORT, () =>
  console.log('Auth Service jalan di port', process.env.PORT)
);