# TugasP9-Backend Service Sistem Manajemen Toko

Nama: Akbar Fitri Andhika
NIM: 2410511011
Kelas: Informatika 

## Arsitektur
```
TugasP9/
├── api-gateway/
│   ├── .env
│   ├── index.js
│   └── package.json
├── auth-service/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   ├── middleware.js
│   └── package.json
├── product-service/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   ├── middleware.js
│   └── package.json
├── order-service/
│   ├── .env
│   ├── db.js
│   ├── index.js
│   ├── middleware.js
│   └── package.json
├── notification-service/
│   ├── .env
│   ├── index.js
│   └── package.json
└── README.md

Order Service -> RabbitMQ -> Notification Service (3094)
```
## Cara Menjalankan

Pastikan XAMPP (MySQL) dan RabbitMQ sudah berjalan.

Jalankan RabbitMQ (Windows):
```bash
net start RabbitMQ
```

Buka 5 terminal, jalankan masing-masing:

```bash
cd auth-service 
node index.js

cd product-service
node index.js

cd order-service
node index.js

cd notification-service
node index.js

cd api-gateway
node index.js
```

Di server menggunakan PM2:

```bash
pm2 start auth-service/index.js
pm2 start product-service/index.js
pm2 start order-service/index.js
pm2 start notification-service/index.js
pm2 start api-gateway/index.js
```

## Endpoint
Base URL: `http://localhost:3170`

| Method | Endpoint       | Auth  | Keterangan         |
|--------|----------------|-------|--------------------|
| POST   | /auth/register | -     | Daftar akun        |
| POST   | /auth/login    | -     | Login, dapat token |
| GET    | /products      | -     | List produk        |
| GET    | /products/:id  | -     | Detail produk      |
| POST   | /products      | Admin | Tambah produk      |
| PUT    | /products/:id  | Admin | Update produk      |
| DELETE | /products/:id  | Admin | Hapus produk       |
| POST   | /orders        | Bearer| Buat order         |
| GET    | /orders        | Bearer| List order         |

## Contoh Request dan Response
### Register
Request:
```json
POST /auth/register
{
  "name": "Akbar",
  "email": "akbarandika@gmail.com",
  "password": "akbar123",
  "role": "admin"
}
```
Response:
```json
{
  "message": "Registrasi berhasil",
  "data": { "id": 1, "name": "Akbar", "email": "akbarandika@gmail.com", "role": "admin" }
}
```

### Login
Request:
```json
POST /auth/login
{
  "email": "akbar@gmail.com",
  "password": "akbar123"
}
```
Response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGci..."
}
```

### Tambah Produk
Request:
```json
POST /products
Authorization: Bearer <token>
{
  "name": "Iphone 17 Pro Max",
  "price": 25000000,
  "stock": 5
}
```
Response:
```json
{
  "message": "Produk ditambahkan",
  "data": { "id": 1, "name": "Iphone 17 Pro Max", "price": 25000000, "stock": 5 }
}
```

### Buat Order
Request:
```json
POST /orders
Authorization: Bearer <token>
{
  "product_id": 1,
  "quantity": 2
}
```
Response:
```json
{
  "message": "Order berhasil dibuat",
  "data": { "id": 1, "product_id": 1, "quantity": 2, "total_price": 50000000, "status": "pending" }
}
```
Setelah order dibuat, Notification Service akan menerima pesan dari RabbitMQ dan menampilkan log di terminal:
```
+++ NOTIFIKASI ORDER BARU +++
Order ID : 1
User : Akbar
Produk : Iphone 17 Pro Max
Qty : 2
Total : Rp 50000000
-----------------------------
```