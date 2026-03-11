# SwiftRoute — Mini Logistics & Delivery Management System

A full-stack logistics platform with role-based access for Customers, Drivers, and Admins.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | SQLite (via `better-sqlite3`) — swap for MySQL/PostgreSQL easily |
| Auth | JWT + bcryptjs |
| API Docs | Swagger (OpenAPI 3.0) |
| Frontend | React 18, React Router v6 |

---

## Project Structure

```
logistics-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # SQLite init, schema, seeding
│   │   │   └── swagger.js        # OpenAPI spec config
│   │   ├── controllers/
│   │   │   ├── authController.js # Login, register, me
│   │   │   ├── orderController.js# CRUD + assign + status
│   │   │   └── userController.js # Users list, drivers, stats
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT authenticate + authorize
│   │   │   └── errorHandler.js   # Validation + error handling
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── userRoutes.js
│   │   └── server.js             # Express app entry point
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance + interceptors
    │   ├── components/
    │   │   ├── Layout.js         # Sidebar + nav
    │   │   ├── StatusBadge.js    # Order status badge
    │   │   └── Pagination.js     # Paginator component
    │   ├── context/
    │   │   └── AuthContext.js    # Auth state + JWT storage
    │   ├── pages/
    │   │   ├── LoginPage.js      # JWT login + demo accounts
    │   │   ├── RegisterPage.js   # User registration
    │   │   ├── DashboardPage.js  # Stats overview
    │   │   ├── OrdersListPage.js # Filter + paginate orders
    │   │   ├── CreateOrderPage.js# Customer: create order
    │   │   ├── AssignDriverPage.js # Admin: assign drivers
    │   │   └── DriverDashboardPage.js # Driver: view + update
    │   ├── App.js                # Router + protected routes
    │   └── index.css             # Global styles (industrial theme)
    └── package.json
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
# .env is already configured
node src/server.js
# OR for dev with auto-reload:
npx nodemon src/server.js
```

Backend runs at: **http://localhost:3001**  
API Docs: **http://localhost:3001/api-docs**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Demo Accounts (auto-seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@logistics.com | password123 |
| Driver | driver@logistics.com | password123 |
| Driver 2 | driver2@logistics.com | password123 |
| Customer | customer@logistics.com | password123 |
| Customer 2 | customer2@logistics.com | password123 |

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → returns JWT token |
| POST | `/api/auth/register` | Create account |
| GET | `/api/auth/me` | Get current user |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer | Create new order |
| GET | `/api/orders` | Admin, Customer | List orders (paginated, filtered) |
| GET | `/api/orders/:id` | All | Get single order |
| POST | `/api/orders/:id/assign` | Admin | Assign driver to order |
| PATCH | `/api/orders/:id/status` | Driver, Admin | Update order status |
| GET | `/api/orders/driver/assigned` | Driver | Get my assigned orders |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/drivers` | Admin | List drivers only |
| GET | `/api/users/stats` | Admin | System statistics |

### Query Parameters (GET /api/orders)
- `status` — Filter: `pending`, `assigned`, `picked`, `delivered`
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10, max: 100)

---

## Order Status Flow

```
pending → assigned → picked → delivered
```

- **Pending**: Order created by customer
- **Assigned**: Admin assigned a driver
- **Picked**: Driver picked up the package  
- **Delivered**: Package delivered

Invalid transitions return a `400` error.

---

## Database Schema

### users
```sql
id TEXT PRIMARY KEY
name TEXT NOT NULL
email TEXT UNIQUE NOT NULL
password TEXT NOT NULL  -- bcrypt hashed
role TEXT CHECK(role IN ('customer', 'driver', 'admin'))
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### orders
```sql
id TEXT PRIMARY KEY
customer_id TEXT REFERENCES users(id)
pickup_address TEXT NOT NULL
delivery_address TEXT NOT NULL
status TEXT DEFAULT 'pending'
notes TEXT
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

### deliveries
```sql
id TEXT PRIMARY KEY
order_id TEXT UNIQUE REFERENCES orders(id)
driver_id TEXT REFERENCES users(id)
assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

---

## Switching to MySQL/PostgreSQL

The app uses `better-sqlite3` for zero-config setup. To use MySQL or PostgreSQL:

1. Replace `better-sqlite3` with `mysql2` or `pg`
2. Update `src/config/database.js` to use a connection pool
3. Adjust SQL syntax (e.g., `TEXT` → `VARCHAR`, `CURRENT_TIMESTAMP` syntax)
4. Add DB credentials to `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=logistics
DB_USER=postgres
DB_PASSWORD=secret
```

---

## Security Features

- **JWT Authentication** — Stateless, expires in 7 days
- **Role-Based Access Control** — Middleware per route
- **Input Validation** — express-validator on all endpoints
- **Password Hashing** — bcryptjs with salt rounds
- **Database Transactions** — Used in assign driver operation
- **CORS** — Configured for frontend origin

---

## Frontend Features

- **Role-based navigation** — Sidebar adapts to user role
- **Protected routes** — Redirect unauthorized users
- **Token persistence** — JWT stored in localStorage
- **Auto-logout** — On 401 responses
- **Form validation** — Client-side + server-side
- **Pagination** — All list pages
- **Status filtering** — Filter orders by status
- **Modal confirmations** — For assign/update actions
- **Loading states** — Spinners on async operations
- **Demo account shortcuts** — One-click fill on login page
