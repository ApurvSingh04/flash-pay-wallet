# Flash Pay Wallet

A scalable digital wallet and peer-to-peer payment platform built with Next.js, Express, PostgreSQL, and Redis/BullMQ.

## Quick Start Guide

### 1. Prerequisites
Make sure you have **Node.js** (v18+) and **Docker** installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Infrastructure (Redis & Database)
Spin up the required Redis and PostgreSQL containers in the background:
```bash
docker-compose up -d
```
*(Make sure your `.env` files have the correct `DATABASE_URL` pointing to your local Postgres).*

### 4. Setup Database & Seed Data
Push the schema to the database and populate it with test users:
```bash
cd packages/db
npx prisma db push
npx prisma db seed
cd ../..
```
*Note: The seed script creates two test users: Alice (`1111111111` / `alice`) and Bob (`2222222222` / `bob`).*

### 5. Run the Project
Launch the User App, Merchant App, and Bank Webhook Worker simultaneously from the root directory:
```bash
npm run dev
```

### 6. Explore
- **User App:** Open `http://localhost:3000` (or `3001`).
- **Login:** Use phone number `1111111111` and password `alice`.

---