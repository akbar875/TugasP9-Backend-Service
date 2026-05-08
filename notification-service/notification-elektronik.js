const amqplib = require('amqplib');
const express = require('express');
require('dotenv').config();

const app = express();

// Untuk mengonsumsi pesan
async function startConsumer() {
    // Koneksi ke RabbitMQ
    const conn = await amqplib.connect(process.env.RABBITMQ_URL);
    const ch = await conn.createChannel();

    // Membuat queue dan menunggu pesan
    await ch.assertQueue('order_created', { durable: true });
    console.log('[Notification] Menunggu pesan...');
    
    // Konsumsi pesan dari queue
    ch.consume('order_created', (msg) => {
        // Pesan tidak ada
        if (!msg) 
            return;

        // Kirim pesan ke console mengenai order yang dibuat
        const data = JSON.parse(msg.content.toString());
        console.log('+++ NOTIFIKASI ORDER BARU +++');
        console.log('Order ID:', data.orderId);
        console.log('User:', data.userName);
        console.log('Produk:', data.productName);
        console.log('Qty:', data.quantity);
        console.log('Total: Rp', data.total);
        console.log('-----------------------------');

        // Konfirmasi pesan diterima
        ch.ack(msg);
    });
}

// Mulai consumer mengonsumsi pesan
startConsumer().catch(console.error);

// Mendapatkan status server dapat dijalankan
app.get('/health', (req, res) => res.json({ service: 'notification', status: 'UP' }));

// Menjalankan server
app.listen(process.env.PORT, () =>
    console.log('Notification Service jalan di port', process.env.PORT)
);