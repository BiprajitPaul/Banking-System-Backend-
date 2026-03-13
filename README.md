# 🏦 BankingApp — Ledger-Based Banking Backend

A production-style RESTful banking backend built with **Node.js**, **Express 5**, and **MongoDB**. It uses a **double-entry ledger** model to guarantee consistent, auditable balances and supports secure JWT authentication, idempotent transactions, rate limiting, and email notifications.

---

## 📐 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                         Client (Postman / Frontend)            │
└────────────────────────┬───────────────────────────────────────┘
                         │  HTTP
┌────────────────────────▼───────────────────────────────────────┐
│                     Express 5 Server (port 3000)               │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐    │
│  │ cookie-parser │  │  express.json │  │  Rate Limiter     │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘    │
│         └─────────────────┼───────────────────┘               │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Routes                              │   │
│  │  /api/auth/*    /api/accounts/*    /api/transactions/*  │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Auth Middleware                         │   │
│  │         JWT verify  ·  Token blacklist check            │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Controllers                          │   │
│  │  auth.controller  account.controller  transaction.ctrl  │   │
│  └────────┬───────────────┬───────────────────┬────────────┘   │
│           │               │                   │                │
│           ▼               ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Mongoose Models                        │   │
│  │  User · Account · Transaction · Ledger · TokenBlacklist │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│  ┌────────────────────────▼────────────────────────────────┐   │
│  │                  Email Service                          │   │
│  │          Nodemailer + Gmail OAuth2                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   MongoDB (Atlas)   │
              │                     │
              └─────────────────────┘
```

---

## ✨ Features

| Category | Details |
|---|---|
| **Authentication** | Register, login, logout with JWT (cookie + Bearer header) |
| **Token Blacklisting** | Logged-out tokens are blacklisted with auto-expiry (3 days TTL index) |
| **Account Management** | Create accounts, list user accounts, check balance |
| **Ledger-Based Balance** | No stored balance field — balance is always derived from immutable ledger entries |
| **Money Transfers** | Atomic peer-to-peer transfers using MongoDB transactions (sessions) |
| **Idempotency** | Every transaction requires a unique idempotency key to prevent double-processing |
| **System Funds** | Dedicated system-user endpoint to seed initial funds into user accounts |
| **Rate Limiting** | IP-based limits on auth endpoints; per-user limits on transfers |
| **Email Notifications** | Registration welcome email + transaction confirmation via Gmail OAuth2 |
| **Immutable Ledger** | Ledger entries cannot be updated, deleted, or replaced after creation |
| **Transaction History** | Paginated endpoint to retrieve user's transaction history |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) |
| **Password Hashing** | `bcryptjs` |
| **Email** | `nodemailer` with Gmail OAuth2 |
| **Cookie Parsing** | `cookie-parser` |
| **pagination** | Custom pagination logic in transaction history endpoint |
| **Rate Limiting** | `express-rate-limit` |
| **Validation** | `express-validator` |
| **Environment** | `dotenv` |
| **Dev Server** | `nodemon` |

---

## 📁 Project Structure

```
BankingApp/
├── server.js                          # Entry point — starts Express server
├── package.json
├── .env                               # Environment variables (not committed)
├── .gitignore
└── src/
    ├── app.js                         # Express app setup & route mounting
    ├── config/
    │   └── db.js                      # MongoDB connection
    ├── controllers/
    │   ├── auth.controller.js         # Register, login, logout
    │   ├── account.controller.js      # Create account, get accounts, balance
    │   └── transaction.controller.js  # Transfer money, seed initial funds
    ├── middlewares/
    │   ├── auth.middleware.js          # JWT auth & system-user guard
    │   └── rateLimit.middleware.js     # Rate limiters (auth + transaction)
    ├── models/
    │   ├── user.model.js              # User schema with password hashing
    │   ├── account.model.js           # Account schema with getBalance()
    │   ├── transaction.model.js       # Transaction schema (PENDING → COMPLETE)
    │   ├── ledger.model.js            # Immutable double-entry ledger
    │   └── blacklist.model.js         # Token blacklist with TTL index
    ├── routes/
    │   ├── auth.routes.js             # /api/auth/*
    │   ├── account.routes.js          # /api/accounts/*
    │   └── transaction.routes.js      # /api/transactions/*
    └── services/
        └── email.service.js           # Nodemailer Gmail OAuth2 transport
```

---

## 📡 API Documentation

### Auth Routes — `/api/auth`

| Method | Endpoint | Rate Limit | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | 5 req/min per IP | No | Register a new user |
| `POST` | `/api/auth/login` | 5 req/min per IP | No | Login and receive JWT |
| `POST` | `/api/auth/logout` | — | No | Logout and blacklist token |

#### `POST /api/auth/register`
```json
// Request Body
{
  "name": "Biprajit",
  "email": "biprajit@example.com",
  "password": "securepass123"
}

// Response 201
{
  "user": {
    "_id": "665a...",
    "email": "biprajit@example.com",
    "name": "Biprajit"
  },
  "token": "eyJhbGciOi..."
}
```

#### `POST /api/auth/login`
```json
// Request Body
{
  "email": "biprajit@example.com",
  "password": "securepass123"
}

// Response 200
{
  "message": "Logged in",
  "user": {
    "_id": "665a...",
    "email": "biprajit@example.com",
    "name": "Biprajit"
  },
  "token": "eyJhbGciOi..."
}
```

#### `POST /api/auth/logout`
```json
// Response 200
{
  "message": "User logged out successfully"
}
```

---

### Account Routes — `/api/accounts` (🔒 Protected)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/accounts/` | JWT | Create a new account |
| `GET` | `/api/accounts/` | JWT | Get all accounts for authenticated user |
| `GET` | `/api/accounts/balance/:accountId` | JWT | Get balance of a specific account |

#### `POST /api/accounts/`
```json
// Response 201
{
  "account": {
    "_id": "665b...",
    "user": "665a...",
    "status": "ACTIVE",
    "currency": "INR",
    "createdAt": "2026-03-10T..."
  }
}
```

#### `GET /api/accounts/balance/:accountId`
```json
// Response 200
{
  "accountId": "665b...",
  "balance": 5000
}
```

---

### Transaction Routes — `/api/transactions` (🔒 Protected)

| Method | Endpoint | Rate Limit | Auth | Description |
|---|---|---|---|---|
| `POST` | `/api/transactions/` | 10 req/min per user | JWT | Transfer money between accounts |
| `POST` | `/api/transactions/system/initial-funds` | — | System User JWT | Seed funds into a user account |
| `GET` | `/api/transactions/history` | — | JWT | Get paginated transaction history for authenticated user |

#### `POST /api/transactions/`
```json
// Request Body
{
  "fromAccount": "665b...",
  "toAccount": "665c...",
  "amount": 1000,
  "idempotencyKey": "unique-key-abc-123"
}

// Response 201
{
  "message": "Transaction successful",
  "transaction": {
    "_id": "665d...",
    "fromAccount": "665b...",
    "toAccount": "665c...",
    "amount": 1000,
    "status": "COMPLETE",
    "idempotencyKey": "unique-key-abc-123"
  }
}
```

#### `POST /api/transactions/system/initial-funds`
```json
// Request Body
{
  "toAccount": "665b...",
  "amount": 10000,
  "idempotencyKey": "seed-funds-001"
}

// Response 201
{
  "message": "Initial funds transaction successful",
  "transaction": { ... }
}
```

---

### Error Responses

```json
// 401 Unauthorized
{ "message": "Unauthorized access" }

// 429 Rate Limit Exceeded
{
  "status": "failed",
  "message": "Too many requests from this IP address. Please try again after 1 minute."
}

// 400 Bad Request
{ "message": "Insufficient balance. Current balance is 500. Required balance is 1000" }
```

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| **Password Hashing** | `bcryptjs` with 10 salt rounds — passwords never stored in plaintext |
| **JWT Authentication** | Stateless auth via signed tokens (3-day expiry); sent in cookie + `Authorization` header |
| **Token Blacklisting** | Logout invalidates tokens; blacklist entries auto-expire via MongoDB TTL index (3 days) |
| **System User Guard** | `authSystemUserMiddleware` restricts fund-seeding to accounts with `systemUser: true` |
| **Immutable Ledger** | Pre-hooks block all update/delete/replace operations on ledger documents |
| **Idempotent Transactions** | Unique idempotency keys prevent duplicate transaction processing |
| **ACID Transactions** | MongoDB sessions ensure atomicity — debit + credit + status update commit together or roll back |
| **Rate Limiting** | Auth endpoints: 5 req/min per IP · Transaction endpoint: 10 req/min per user |
| **Password Field Hidden** | `select: false` on password field — never returned in queries unless explicitly requested |
| **System User Immutable** | `systemUser` field is `immutable: true` — cannot be changed after account creation |

---

## 💸 Transaction Flow

The money transfer process follows a strict **10-step sequence** within a MongoDB session:

```
Client                    Server                       MongoDB
  │                         │                             │
  │  POST /api/transactions │                             │
  │ ────────────────────────>                             │
  │                         │                             │
  │                    1. Validate request fields          │
  │                    2. Check idempotency key            │
  │                         │── findOne(idempotencyKey) ──>│
  │                         │<── exists? return early ─────│
  │                    3. Verify both accounts are ACTIVE  │
  │                    4. Derive sender balance from ledger│
  │                         │── aggregate(ledger) ────────>│
  │                         │<── balance ─────────────────│
  │                         │                             │
  │                    ┌─── 5-9: MongoDB Session ────────┐│
  │                    │ 5. Create transaction (PENDING)  ││
  │                    │ 6. Create DEBIT ledger entry     ││
  │                    │ 7. Create CREDIT ledger entry    ││
  │                    │ 8. Update transaction → COMPLETE ││
  │                    │ 9. Commit session                ││
  │                    └──────────────────────────────────┘│
  │                         │                             │
  │                   10. Send email notification          │
  │                         │                             │
  │  201 { transaction }    │                             │
  │ <────────────────────────                             │
```

**Double-Entry Ledger Principle:**
- Every transfer creates **two** ledger entries: a `DEBIT` on the sender and a `CREDIT` on the receiver.
- Account balance = `SUM(credits) - SUM(debits)` — computed on the fly via MongoDB aggregation.
- Ledger entries are **immutable** — they cannot be modified or deleted once created.

---

## 🐳 Docker Setup

> The project does not yet include a Dockerfile. Below is a ready-to-use Docker setup you can add.

### 1. Create `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 2. Create `docker-compose.yml`

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

volumes:
  mongo_data:
```

### 3. Create `.dockerignore`

```
node_modules
.env
.git
```

### 4. Run with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up --build -d

# Stop containers
docker-compose down
```

> **Note:** When using Docker Compose with the bundled MongoDB, set `MONGO_URI=mongodb://mongo:27017/bankingapp` in your `.env` file.

---

## 🚀 Running Locally — Step by Step

### Prerequisites

- **Node.js** v18+ installed → [download](https://nodejs.org/)
- **MongoDB** running locally or a MongoDB Atlas connection string
- **Gmail OAuth2 credentials** for email notifications (optional)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd BankingApp
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- `express` — web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken` — JWT creation & verification
- `bcryptjs` — password hashing
- `cookie-parser` — parse cookies from requests
- `dotenv` — environment variable management
- `nodemailer` — email sending
- `express-rate-limit` — API rate limiting
- `express-validator` — request validation
- `nodemon` — auto-restart during development

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/bankingapp

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Gmail OAuth2 (for email notifications)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
REFRESH_TOKEN=your-google-refresh-token
```

### 4. Start MongoDB

If running locally:
```bash
mongod
```

Or use MongoDB Atlas and update `MONGO_URI` in `.env`.

### 5. Start the Server

**Development (auto-restart on changes):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server starts on **http://localhost:3000**.

### 6. Test the API

Use **Postman**, **cURL**, or any HTTP client:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Biprajit","email":"biprajit@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"biprajit@example.com","password":"pass123"}'

# Create Account (use token from login)
curl -X POST http://localhost:3000/api/accounts/ \
  -H "Authorization: Bearer <your-token>"

# Check Balance
curl http://localhost:3000/api/accounts/balance/<accountId> \
  -H "Authorization: Bearer <your-token>"
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start with nodemon (auto-reload) |
| `start` | `npm start` | Start in production mode |

---

## 🖥 Frontend (React + Vite)

A complete frontend is available in the `frontend/` folder with these pages:

- Login
- Register
- Dashboard
- Accounts
- Transfer Money
- Transaction History (paginated)

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:3000`.

### Run Backend + Frontend Together

Terminal 1 (backend):

```bash
npm run dev
```

Terminal 2 (frontend):

```bash
cd frontend
npm run dev
```

### API Notes

- Frontend base URL is `/api` (via Vite proxy).
- Authentication uses JWT + cookie support (`withCredentials: true`).
- For account creation, frontend uses `POST /api/accounts/create` (current backend route).

---

## 👤 Author



**Biprajit Paul** **LinkedIn:** [linkedin.com/in/biprajitpaul](https://www.linkedin.com/in/biprajitpaul)

---


"# Banking-System-Backend-" 
