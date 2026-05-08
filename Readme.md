# TugasP9-Backend Service Sistem Manajemen Toko

Nama: Akbar Fitri Andhika
NIM: 2410511011
Kelas: Informatika 

## Arsitektur
```
TugasP9/
├── api-gateway/
│   ├── .env
│   ├── gateway-elektronik.js
│   └── package.json
├── auth-service/
│   ├── .env
│   ├── db.js
│   ├── auth-elektronik.js
│   ├── middleware.js
│   └── package.json
├── product-service/
│   ├── .env
│   ├── db.js
│   ├── product-elektronik.js
│   ├── middleware.js
│   └── package.json
├── order-service/
│   ├── .env
│   ├── db.js
│   ├── order-elektronik.js
│   ├── middleware.js
│   └── package.json
├── notification-service/
│   ├── .env
│   ├── notification-elektronik.js
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
node auth-elektronik.js

cd product-service
node product-elektronik.js

cd order-service
node order-elektronik.js

cd notification-service
node notification-elektronik.js

cd api-gateway
node gateway-elektronik.js
```

Di server menggunakan PM2:

```bash
pm2 start auth-service/auth-elektronik.js --name auth-service
pm2 start product-service/product-elektronik.js --name product-service
pm2 start order-service/order-elektronik.js --name order-service
pm2 start notification-service/notification-elektronik.js --name notification-service
pm2 start api-gateway/gateway-elektronik.js --name api-gateway
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

### Health Check
Request:
```
GET /health
```
Response:
```json
{
  "status": "UP",
  "timestamp": "2026-05-08T10:00:00.000Z"
}
```

### Register
Request:
```json
POST /auth/register
{
  "name": "Akbar",
  "email": "akbar@mail.com",
  "password": "123456",
  "role": "admin"
}
```
Response:
```json
{
  "message": "Registrasi berhasil",
  "data": { "id": 1, "name": "Akbar", "email": "akbar@mail.com", "role": "admin" }
}
```

### Login
Request:
```json
POST /auth/login
{
  "email": "akbar@mail.com",
  "password": "123456"
}
```
Response:
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGci..."
}
```

### List Produk
Request:
```
GET /products
```
Response:
```json
{
  "data": [
    { "id": 1, "name": "Laptop", "price": "15000000.00", "stock": 10, "created_at": "2026-05-08T10:00:00.000Z" }
  ]
}
```

### Detail Produk
Request:
```
GET /products/1
```
Response:
```json
{
  "data": { "id": 1, "name": "Laptop", "price": "15000000.00", "stock": 10, "created_at": "2026-05-08T10:00:00.000Z" }
}
```

### Tambah Produk
Request:
```json
POST /products
Authorization: Bearer 
{
  "name": "Laptop",
  "price": 15000000,
  "stock": 10
}
```
Response:
```json
{
  "message": "Produk ditambahkan",
  "data": { "id": 1, "name": "Laptop", "price": 15000000, "stock": 10, "created_at": "2026-05-08T10:00:00.000Z" }
}
```

### Update Produk
Request:
```json
PUT /products/1
Authorization: Bearer 
{
  "name": "Laptop Pro",
  "price": 17000000,
  "stock": 8
}
```
Response:
```json
{
  "message": "Produk diupdate"
}
```

### Hapus Produk
Request:
```
DELETE /products/1
Authorization: Bearer <token>
```
Response:
```json
{
  "message": "Produk dihapus"
}
```

### Buat Order
Request:
```json
POST /orders
Authorization: Bearer 
{
  "product_id": 1,
  "quantity": 2
}
```
Response:
```json
{
  "message": "Order berhasil dibuat",
  "data": { "id": 1, "product_id": 1, "quantity": 2, "total_price": 30000000, "status": "pending", "created_at": "2026-05-08T10:05:00.000Z" }
}
```
Notification Service akan menerima pesan dari RabbitMQ dan menampilkan log:
```
--- NOTIFIKASI ORDER BARU ---
Order ID : 1
User     : Akbar
Produk   : Laptop
Qty      : 2
Total    : Rp 30000000
-----------------------------
```

### List Order
Request:
```
GET /orders
Authorization: Bearer <token>
```
Response:
```json
{
  "data": [
    { "id": 1, "user_id": 1, "product_id": 1, "quantity": 2, "total_price": "30000000.00", "status": "pending", "created_at": "2026-05-08T10:05:00.000Z" }
  ]
}
```