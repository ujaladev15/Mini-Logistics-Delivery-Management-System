# Mini-Logistics-Delivery-Management-System

<div align="center">

<br/>

# 🚚 SwiftRoute

### Mini Logistics & Delivery Management System

<p>A production-ready full-stack web application for managing end-to-end deliveries.<br/>Built with role-based access for <strong>Customers</strong>, <strong>Drivers</strong>, and <strong>Admins</strong>.</p>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![Knex](https://img.shields.io/badge/Knex.js-E16426?style=for-the-badge&logo=knexdotjs&logoColor=white)](https://knexjs.org/)

<br/>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [System Workflow](#-system-workflow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Order Status Flow](#-order-status-flow)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Switching Databases](#-switching-to-mysql--postgresql)
- [License](#-license)

---

## 🌟 Overview

SwiftRoute is a **Mini Logistics & Delivery Management System** that digitizes the complete delivery lifecycle — from a customer placing an order to a driver marking it delivered.

The system has three distinct user roles, each with their own dashboard and permissions:

<br/>

| Role | What They See | What They Can Do |
|------|--------------|-----------------|
| 📦 **Customer** | Their own orders only | Create orders, track real-time status |
| 🛵 **Driver** | Only orders assigned to them | View delivery details, update pickup & delivery status |
| 👨‍💻 **Admin** | All orders across all customers | Assign drivers to pending orders, monitor stats |

<br/>

> Think of it as a simplified internal tool used by companies like Dunzo, Porter, or Delhivery to coordinate their delivery operations.

---

## 🎯 Live Demo

Start both servers and use these URLs:

| Service | URL |
|---------|-----|
| 🖥️ Frontend App | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:3001 |
| 📄 Swagger API Docs | http://localhost:3001/api-docs |

---

## ✨ Features

### 🔧 Backend
- ✅ RESTful API following HTTP conventions (GET, POST, PATCH)
- ✅ JWT-based stateless authentication with 7-day token expiry
- ✅ Role-based access control (RBAC) via reusable middleware
- ✅ Passwords hashed with bcrypt (10 salt rounds — never stored plain)
- ✅ Full input validation using `express-validator` on every endpoint
- ✅ Database transactions for atomic driver assignment (no partial updates)
- ✅ Pagination (`page`, `limit`) and status filtering on all list endpoints
- ✅ Swagger / OpenAPI 3.0 auto-generated interactive documentation
- ✅ Meaningful error messages with correct HTTP status codes (400, 401, 403, 404, 500)
- ✅ Auto-seeded demo users on first startup

### 🎨 Frontend
- ✅ React 18 with functional components and hooks
- ✅ React Router v6 with protected routes per role
- ✅ Role-adaptive sidebar navigation (each role sees only their pages)
- ✅ Axios instance with request interceptor (auto-attaches JWT token)
- ✅ Response interceptor for auto-logout on token expiry (401)
- ✅ Client-side form validation before any API call is made
- ✅ Paginated and filterable order tables
- ✅ Modal-based driver assignment and status update flows
- ✅ Loading spinners, empty states, and error/success alerts
- ✅ Demo account quick-fill buttons on login page

---

## 🔄 System Workflow

This section explains exactly how each role interacts with the system from start to finish.

---

### 🔐 Authentication Flow (All Users)

```
User visits localhost:3000
         │
         ▼
AuthContext checks localStorage for JWT token
         │
    ┌────┴────┐
    │         │
 Token      No token
 found      found
    │         │
    ▼         ▼
Auto-login  Redirect to
            /login page
         │
         ▼
User enters email + password
         │
         ▼
POST /api/auth/login
         │
         ▼
Backend: find user by email → bcrypt.compare(password)
         │
    ┌────┴────┐
    │         │
 Match     No match
    │         │
    ▼         ▼
Generate    401 "Invalid
JWT token   credentials"
    │
    ▼
Frontend stores token in localStorage
Redirects based on role:
  admin/customer → /dashboard
  driver         → /driver/orders
```

> Every API call after login automatically gets `Authorization: Bearer <token>` injected by the Axios request interceptor. If the token expires and the server returns `401`, the response interceptor clears localStorage and redirects to `/login`.

---

### 📦 Customer Workflow

```
1. Customer logs in → lands on Dashboard
         │
         ▼
2. Clicks "Create Order" → /orders/create
         │
         ▼
3. Fills form:
   - Pickup Address:   "123 MG Road, Bangalore"
   - Delivery Address: "456 Brigade Road, Bangalore"
   - Notes (optional): "Fragile, handle with care"
         │
         ▼
4. Client-side validation:
   ✓ Both fields not empty?
   ✓ Each address at least 10 characters?
   ✓ Pickup ≠ Delivery address?
   → Fails? Show red error, stop here.
         │
         ▼
5. POST /api/orders
   Backend validates + creates order
   Status set to: PENDING
         │
         ▼
6. Success → "Order #a1b2c3d4 created!"
   Auto-redirected to /orders list
         │
         ▼
7. Customer can filter orders by status
   and see real-time updates as admin
   assigns a driver and driver delivers
```

---

### 👨‍💻 Admin Workflow

```
1. Admin logs in → sees Dashboard with stats:
   Total Orders | Pending | Assigned | Delivered
   Total Drivers | Total Customers
         │
         ▼
2. Clicks "Assign Drivers" → /orders/assign
         │
         ▼
3. Two API calls fire simultaneously:
   GET /api/orders?status=pending   → pending orders table
   GET /api/users/drivers           → driver dropdown list
         │
         ▼
4. Admin sees table of pending orders
   Clicks "Assign" on any order
         │
         ▼
5. Modal opens:
   - Shows order details (from → to)
   - Dropdown to select a driver
         │
         ▼
6. Admin picks "John Driver" → Confirm
         │
         ▼
7. POST /api/orders/:id/assign
   Backend checks:
   ✓ Order exists?
   ✓ Order status is 'pending'?  → else 400 error
   ✓ Driver exists with role='driver'? → else 404 error
         │
         ▼
8. DATABASE TRANSACTION (atomic):
   ┌────────────────────────────────────┐
   │ INSERT into deliveries             │
   │   { order_id, driver_id,           │
   │     assigned_at: NOW() }           │
   │                                    │
   │ UPDATE orders                      │
   │   SET status = 'assigned'          │
   │                                    │
   │ If either fails → ROLLBACK both    │
   └────────────────────────────────────┘
         │
         ▼
9. Modal closes, order disappears from
   pending list, count updates ✓
```

---

### 🛵 Driver Workflow

```
1. Driver logs in → lands on /driver/orders
         │
         ▼
2. GET /api/orders/driver/assigned
   Backend query:
   SELECT orders WHERE deliveries.driver_id = ME
   (Driver ONLY sees their own assigned orders)
         │
         ▼
3. Driver sees their order list:
   ┌──────────┬──────────┬────────────┬──────────┬───────────────┐
   │ Order ID │ Customer │  From→To   │ Status   │    Action     │
   ├──────────┼──────────┼────────────┼──────────┼───────────────┤
   │ a1b2...  │ Alice    │ MG Rd →... │ ASSIGNED │ Update Status │
   └──────────┴──────────┴────────────┴──────────┴───────────────┘
         │
         ▼
4. Driver clicks "Update Status"
   Modal shows:
   Current: ASSIGNED → Next: PICKED
         │
         ▼
5. PATCH /api/orders/:id/status
   Body: { status: "picked" }
   Backend validates:
   ✓ Is this driver assigned to this order? → else 403
   ✓ Is 'assigned' → 'picked' a valid transition? → else 400
         │
         ▼
6. Status updated → Driver clicks Update again
   Current: PICKED → Next: DELIVERED
         │
         ▼
7. Final PATCH → status = 'delivered'
   Row shows "✓ Done" — no more action button
```

---

### 🔁 Complete End-to-End Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  CUSTOMER         SYSTEM              ADMIN       DRIVER     │
│                                                              │
│  Creates order ──► status: PENDING                           │
│                         │                                    │
│                         └──────────────► Sees pending order  │
│                                         Assigns driver       │
│                         │                                    │
│                    status: ASSIGNED ◄───────────────────────┐│
│                         │                          Driver   ││
│                         └─────────────────────────► notified││
│                                                             ││
│                    status: PICKED ◄─────── Driver picks up  ││
│                         │                                   ││
│  Sees update ◄──────────┤                                   ││
│                         │                                   ││
│                    status: DELIVERED ◄─── Driver delivers   ││
│                                                              │
│  Order complete ✅                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

### 🛡️ How Protected Routes Work

```
User navigates to /orders/assign (Admin only)
         │
         ▼
React <PrivateRoute roles={['admin']}> checks:
         │
    ┌────┴────┐
    │         │
Not logged   Logged in
    in           │
    │        Check role === 'admin'?
    ▼            │
Redirect     ┌──┴──┐
to /login    │     │
           Yes    No
            │     │
            ▼     ▼
         Render  Redirect
          page  to /dashboard

  ⚠️  Even if bypassed on frontend,
      the backend authorize('admin')
      middleware returns 403 Forbidden.
      Security is enforced at BOTH layers.
```

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js v18+ | Fast, non-blocking I/O for API server |
| **Framework** | Express.js 4 | Minimal, flexible REST API framework |
| **Database** | SQLite | Zero-config, file-based SQL database |
| **Query Builder** | Knex.js | SQL builder with transactions, migrations, multi-DB support |
| **Authentication** | JSON Web Tokens | Stateless auth — no server-side sessions needed |
| **Password Security** | bcryptjs | Industry-standard hashing with salt rounds |
| **Validation** | express-validator | Declarative server-side input validation |
| **API Documentation** | swagger-jsdoc + swagger-ui-express | Auto-generated OpenAPI 3.0 interactive docs |
| **Frontend Library** | React 18 | Component-based UI with hooks |
| **Routing** | React Router v6 | Declarative client-side routing |
| **HTTP Client** | Axios | Promise-based HTTP with interceptors |

> **Note on Database:** SQLite requires zero setup — perfect for running locally. Switching to **MySQL** or **PostgreSQL** only requires changing the knex connection config. All controllers and queries remain unchanged.

---

## 📁 Project Structure

```
swiftroute/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # Knex init, table creation, demo data seeding
│   │   │   └── swagger.js           # OpenAPI 3.0 spec configuration
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js    # login(), register(), getMe()
│   │   │   ├── orderController.js   # createOrder(), getOrders(), assignDriver(),
│   │   │   │                        # updateStatus(), getDriverOrders()
│   │   │   └── userController.js    # getUsers(), getDrivers(), getStats()
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # authenticate() — verify JWT
│   │   │   │                        # authorize(...roles) — check role
│   │   │   └── errorHandler.js      # validateRequest() — express-validator errors
│   │   │                            # errorHandler() — global 500 handler
│   │   │                            # notFound() — 404 handler
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # POST /login, POST /register, GET /me
│   │   │   ├── orderRoutes.js       # Full CRUD + assign + status update
│   │   │   └── userRoutes.js        # GET /users, /drivers, /stats
│   │   │
│   │   └── server.js                # Express app setup, middleware, route mounting
│   │
│   ├── .env                         # Environment variables (gitignored)
│   ├── .env.example                 # Template for environment variables
│   ├── .gitignore                   # node_modules, *.db, .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with auth interceptors
│   │   │
│   │   ├── components/
│   │   │   ├── Layout.js            # App shell: sidebar, nav links, logout
│   │   │   ├── StatusBadge.js       # Colored pill badge for order status
│   │   │   └── Pagination.js        # Reusable page navigation component
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state, login/logout/register
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.js         # Email/password login + demo quick-fill
│   │   │   ├── RegisterPage.js      # New user registration with role select
│   │   │   ├── DashboardPage.js     # Stats cards + recent orders table
│   │   │   ├── OrdersListPage.js    # Paginated order table with status filter
│   │   │   ├── CreateOrderPage.js   # [Customer] New order form
│   │   │   ├── AssignDriverPage.js  # [Admin] Pending orders + assign modal
│   │   │   └── DriverDashboardPage.js # [Driver] Assigned orders + update modal
│   │   │
│   │   ├── App.js                   # Router setup + PrivateRoute component
│   │   ├── index.js                 # React DOM entry point
│   │   └── index.css                # Global styles (industrial dark theme)
│   │
│   ├── .env                         # REACT_APP_API_URL
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## 🗃 Database Schema

Three tables with clear relationships:

```
users ──────────────────────────────────────────────────────────
  id           TEXT  PK (UUID)
  name         TEXT  NOT NULL
  email        TEXT  UNIQUE NOT NULL
  password     TEXT  NOT NULL  ← bcrypt hash, never plaintext
  role         TEXT  IN ('customer', 'driver', 'admin')
  created_at   DATETIME

orders ─────────────────────────────────────────────────────────
  id                TEXT  PK (UUID)
  customer_id       TEXT  FK → users.id
  pickup_address    TEXT  NOT NULL
  delivery_address  TEXT  NOT NULL
  status            TEXT  IN ('pending','assigned','picked','delivered')
  notes             TEXT  nullable
  created_at        DATETIME
  updated_at        DATETIME  ← updated on every status change

deliveries ─────────────────────────────────────────────────────
  id           TEXT  PK (UUID)
  order_id     TEXT  FK → orders.id  UNIQUE
  driver_id    TEXT  FK → users.id
  assigned_at  DATETIME
```

**Relationships:**
- One `user` (customer) → many `orders`
- One `order` → one `delivery` (one driver per order)
- One `user` (driver) → many `deliveries`

---

## 📡 API Reference

Full interactive documentation with live testing available at:
**`http://localhost:3001/api-docs`**

---

### 🔐 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ Public | Login with email + password → returns JWT |
| `POST` | `/api/auth/register` | ❌ Public | Create new account (customer or driver) |
| `GET` | `/api/auth/me` | ✅ Any | Get currently logged-in user info |

**Login Request:**
```json
POST /api/auth/login
{
  "email": "customer@logistics.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "name": "Alice Customer",
    "email": "customer@logistics.com",
    "role": "customer"
  }
}
```

---

### 📦 Order Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/orders` | 📦 Customer | Create a new delivery order |
| `GET` | `/api/orders` | 📦 Customer, 👨‍💻 Admin | List orders (paginated + filtered) |
| `GET` | `/api/orders/:id` | ✅ Any | Get single order with full details |
| `POST` | `/api/orders/:id/assign` | 👨‍💻 Admin | Assign a driver to a pending order |
| `PATCH` | `/api/orders/:id/status` | 🛵 Driver | Update order delivery status |
| `GET` | `/api/orders/driver/assigned` | 🛵 Driver | Get all orders assigned to me |

**Create Order Request:**
```json
POST /api/orders
Authorization: Bearer <token>
{
  "pickup_address": "123 MG Road, Connaught Place, New Delhi",
  "delivery_address": "456 Park Street, Lajpat Nagar, New Delhi",
  "notes": "Fragile items, please handle carefully"
}
```

**Assign Driver Request:**
```json
POST /api/orders/:id/assign
Authorization: Bearer <admin-token>
{
  "driver_id": "driver-uuid-here"
}
```

**Update Status Request:**
```json
PATCH /api/orders/:id/status
Authorization: Bearer <driver-token>
{
  "status": "picked"
}
```

**Query Parameters for GET `/api/orders`:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter: `pending` `assigned` `picked` `delivered` |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Results per page (max: 100) |

---

### 👥 User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | 👨‍💻 Admin | List all users, optionally filter by `?role=driver` |
| `GET` | `/api/users/drivers` | 👨‍💻 Admin | List all driver accounts |
| `GET` | `/api/users/stats` | 👨‍💻 Admin | System-wide statistics |

**Stats Response:**
```json
{
  "stats": {
    "totalOrders": 24,
    "totalDrivers": 3,
    "totalCustomers": 8,
    "byStatus": {
      "pending": 5,
      "assigned": 4,
      "picked": 3,
      "delivered": 12
    }
  }
}
```

---

### ❌ Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Human readable error message"
}
```

Validation errors include field-level details:
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Valid email required" },
    { "field": "password", "message": "Password required" }
  ]
}
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher** (v22 recommended)
- **npm v8+** (comes with Node.js)
- No database installation needed — SQLite is file-based

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/swiftroute.git
cd swiftroute
```

---

### Step 2 — Setup & Run Backend

```bash
cd backend

# Install all dependencies
npm install

# Copy environment config (defaults work out of the box)
cp .env.example .env

# Start the server
node src/server.js
```

You should see:
```
✅ Demo users seeded
✅ Database initialized
🚀 Logistics API running on http://localhost:3001
📄 API Docs: http://localhost:3001/api-docs
```

> For **development with auto-reload**: `npx nodemon src/server.js`

---

### Step 3 — Setup & Run Frontend

Open a **new terminal window**:

```bash
cd frontend

# Install all dependencies
npm install

# Start the React development server
npm start
```

The browser will auto-open at **http://localhost:3000**

---

### Step 4 — Login and Explore

Use any of the demo accounts below, or click the quick-fill buttons on the login page.

---

## 👥 Demo Accounts

All accounts are **auto-created on the first server start**. No manual setup needed.

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 👨‍💻 **Admin** | `admin@logistics.com` | `password123` | Full system access |
| 🛵 **Driver** | `driver@logistics.com` | `password123` | Own assigned orders |
| 🛵 **Driver 2** | `driver2@logistics.com` | `password123` | Own assigned orders |
| 📦 **Customer** | `customer@logistics.com` | `password123` | Own orders only |
| 📦 **Customer 2** | `customer2@logistics.com` | `password123` | Own orders only |

> 💡 On the login page, click the **Admin**, **Driver**, or **Customer** shortcut buttons to auto-fill credentials instantly.

---

### Recommended Demo Sequence

**Step 1** — Login as **Customer** → Create a new order

**Step 2** — Login as **Admin** → Go to "Assign Drivers" → Assign a driver to the pending order

**Step 3** — Login as **Driver** → Go to "My Deliveries" → Update status to Picked, then Delivered

**Step 4** — Login as **Customer** again → See the order status updated to Delivered ✅

---

## 🔄 Order Status Flow

```
  [Customer places order]
           │
           ▼
      ┌─────────┐
      │ PENDING │ ──── Initial state when order is created
      └────┬────┘
           │
           │  Admin assigns a driver
           ▼
      ┌──────────┐
      │ ASSIGNED │ ──── Driver has been assigned, not yet picked up
      └────┬─────┘
           │
           │  Driver picks up the package
           ▼
      ┌────────┐
      │ PICKED │ ──── Package is in transit with the driver
      └────┬───┘
           │
           │  Driver completes the delivery
           ▼
      ┌───────────┐
      │ DELIVERED │ ──── Order complete ✅
      └───────────┘
```

**Business rules enforced by the API:**

| Rule | HTTP Response if Violated |
|------|--------------------------|
| Only `pending` orders can be assigned a driver | `400` — "Only pending orders can be assigned" |
| Status can only move **forward**, never backward | `400` — "Invalid transition from X to Y" |
| Only the **assigned driver** can update their order | `403` — "You are not assigned to this order" |
| Driver must exist with `role = 'driver'` | `404` — "Driver not found" |

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
DB_PATH=./logistics.db
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port the API server listens on |
| `JWT_SECRET` | *(required)* | Secret for signing JWT tokens — **use a long random string in production** |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration (`7d`, `24h`, `30m`, etc.) |
| `NODE_ENV` | `development` | Environment (`development` or `production`) |
| `DB_PATH` | `./logistics.db` | File path for the SQLite database |

### Frontend — `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| **Password Storage** | bcrypt with 10 salt rounds — plaintext never stored |
| **Authentication** | JWT tokens required on all protected endpoints |
| **Authorization** | `authorize(...roles)` middleware on every route |
| **Input Validation** | express-validator on server + React validation on client |
| **Atomic Operations** | knex transactions prevent partial DB updates |
| **Token Expiry** | JWT expires in 7 days, frontend auto-clears on 401 |

> ⚠️ **Production Note:** This project stores JWT in `localStorage`, which is vulnerable to XSS attacks. For production, use `httpOnly` cookies with CSRF protection instead.

---

## 🔧 Switching to MySQL / PostgreSQL

The entire app is built on `knex`, making database migration trivial.

### For PostgreSQL

```bash
cd backend
npm install pg
```

Update `backend/.env`:
```env
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swiftroute
DB_USER=postgres
DB_PASSWORD=your_password
```

Update `backend/src/config/database.js`:
```js
db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
});
```

### For MySQL

```bash
npm install mysql2
```

Same `.env` changes above, but set `DB_CLIENT=mysql2` and `DB_PORT=3306`.

> ✅ **No changes needed** in controllers, routes, or business logic.



<div align="center">

**Built with ❤️ using Node.js, Express.js, React, and SQLite**

<br/>

⭐ If you found this project helpful, please consider giving it a star!

</div>
