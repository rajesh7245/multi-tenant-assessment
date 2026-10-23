# Multi-Tenant Organization & E-Commerce Platform

A full-stack multi-tenant organization and product ordering platform built with **Node.js, Express, React, and PostgreSQL (Neon)**.

The system supports organization registration, isolated tenant databases, employee role management, product management, customer accounts, product purchasing, inventory updates, and order tracking.

---

## 🚀 Features

### Organization Management
- Organization signup and signin
- Unique Organization ID validation
- Unique Organization Name validation
- JWT-based authentication
- Organization-specific dashboard
- Subscription information
- Separate PostgreSQL database for each organization

### Multi-Tenant Architecture
- Central/master PostgreSQL database
- Dynamically created PostgreSQL database for every organization
- Each tenant database contains its own:
  - Products
  - Employees
  - Roles
  - Permissions
  - Orders
  - Order Items
- Tenant databases are created automatically during organization signup

### Employee & Role Management
Two predefined employee roles are supported:

#### Inventory Manager
- Create products
- View products
- Update products
- Delete products
- View customer orders

#### Account Manager
- View products
- View customer orders
- Update order status

### Customer Platform
- Customer signup
- Customer signin
- Global customer accounts
- Browse organization products
- Product purchasing
- Delivery address collection
- Order placement
- Inventory reduction after successful purchase
- Customer order tracking

### Order Management
- Product-based orders
- Order items
- Customer information
- Delivery address
- Order totals
- Inventory validation
- Transaction-based order creation
- Order status management

Supported order statuses:

- Pending
- Processing
- Shipped
- Delivered

---

## 🏗️ Architecture

The application uses a master database together with isolated tenant databases.

```text
                         ┌──────────────────────┐
                         │      React App       │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
                  ▼                                   ▼
        ┌────────────────────┐             ┌────────────────────┐
        │   Master Database  │             │   Tenant Database  │
        │                    │             │                    │
        │ organizations      │             │ products           │
        │ users              │             │ employees          │
        │ customers          │             │ roles              │
        │ subscriptions      │             │ permissions        │
        │                    │             │ orders             │
        └────────────────────┘             │ order_items        │
                                           └────────────────────┘
                                                     │
                                                     │
                                      One database per organization
```

### Master Database

The master database stores platform-level information:

- Organizations / tenants
- Organization users
- Global customers
- Subscription information

### Tenant Databases

Every organization receives its own PostgreSQL database.

Example:

```text
tenant_9
tenant_10
tenant_11
```

Each tenant database contains the organization's business data.

This provides database-level isolation between organizations.

---

## 🛠️ Technology Stack

### Frontend
- React
- React Router
- Axios
- CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- `pg`
- JWT
- bcrypt
- dotenv

### Database
- PostgreSQL
- Neon PostgreSQL

---

## 📁 Project Structure

```text
multi-tenant-assessment/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── createTenantDatabase.js
│   │   │   ├── db.js
│   │   │   ├── schema.sql
│   │   │   └── tenantDb.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── employeeController.js
│   │   │   ├── orderController.js
│   │   │   └── productController.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── customerRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── productRoutes.js
│   │   │
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CustomerHome.jsx
│   │   │   ├── CustomerSignin.jsx
│   │   │   ├── CustomerSignup.jsx
│   │   │   ├── CustomerStore.jsx
│   │   │   ├── CustomerOrder.jsx
│   │   │   ├── CustomerTracking.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Signin.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication

The application uses JWT authentication.

### Organization Authentication

Organization users authenticate using:

- Organization ID
- Email
- Password

The JWT contains tenant and role information.

### Customer Authentication

Customers authenticate using:

- Email
- Password

Customer accounts are stored globally in the master database so that the same customer can interact with different organizations.

---

## 🛒 Customer Purchase Flow

```text
Customer Homepage
       │
       ▼
Select Organization
       │
       ▼
Browse Products
       │
       ▼
Select Product
       │
       ▼
Enter Quantity
       │
       ▼
Enter Delivery Address
       │
       ▼
Place Order
       │
       ▼
Validate Inventory
       │
       ▼
Create Order + Order Items
       │
       ▼
Reduce Product Inventory
       │
       ▼
Order Tracking
```

Order creation uses a database transaction so that the order and inventory update are handled together.

---

## 📦 Organization Workflow

```text
Organization Signup
        │
        ▼
Create Organization
        │
        ▼
Create Tenant PostgreSQL Database
        │
        ▼
Create Tenant Tables
        │
        ▼
Create Default Roles & Permissions
        │
        ▼
Create Organization Admin
        │
        ▼
Organization Dashboard
```

---

## 🔑 Roles and Permissions

| Role | Products | Orders |
|------|----------|--------|
| Inventory Manager | Create / Read / Update / Delete | Read |
| Account Manager | Read | Read / Update |

The tenant database stores roles and permissions separately for each organization.

---

## 🌐 API Endpoints

### Organization Authentication

```text
POST /api/auth/signup
POST /api/auth/signin
GET  /api/auth/subscription
```

### Customer Authentication

```text
POST /api/customers/signup
POST /api/customers/signin
```

### Products

```text
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Employees

```text
GET    /api/employees/roles
GET    /api/employees
POST   /api/employees
DELETE /api/employees/:id
```

### Orders

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
GET  /api/orders/customer
PUT  /api/orders/:id/status
```

---

## ⚙️ Environment Variables

The backend uses environment variables for the database connection and JWT configuration.

Example:

```env
DATABASE_URL=your_neon_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

> The actual environment values are configured separately and should not be documented in this README.

---

## ▶️ Running the Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node src/server.js
```

The backend runs on:

```text
http://localhost:5000
```

---

## ▶️ Running the Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will be available through the URL shown by Vite.

---

## 🗄️ Database

The application uses **Neon PostgreSQL**.

The master database contains the platform-level tables, while each organization receives a separate PostgreSQL database.

Tenant databases are created dynamically when an organization signs up.

Example:

```text
Organization
    ↓
Tenant ID = 11
    ↓
tenant_11
```

The tenant database is then initialized with the required tables, roles, and permissions.

---

## 🔄 Order Status Lifecycle

Orders can move through the following lifecycle:

```text
Pending
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

Organization staff can update order status according to their assigned permissions.

---

## 🧪 Testing

The application can be tested through the following flows:

### Organization
1. Create an organization
2. Sign in using the organization ID
3. Access the dashboard
4. Create products
5. Manage employees
6. View and update orders

### Customer
1. Create a customer account
2. Sign in
3. Select an organization
4. Browse products
5. Purchase a product
6. View order information
7. Track the order

---

## 🎯 Key Design Decisions

### Database-per-Tenant

Each organization receives its own PostgreSQL database instead of sharing business tables between organizations.

This provides stronger tenant isolation and keeps organization data separated at the database level.

### Global Customers

Customers are stored in the master database rather than inside individual tenant databases.

This allows a customer to use one account across the platform and purchase products from different organizations.

### Tenant Business Data

Products, employees, orders, order items, roles, and permissions are stored inside the organization's tenant database.

---

## 📌 Project Status

The application includes:

- Organization authentication
- Customer authentication
- Multi-tenant database creation
- Tenant table initialization
- Product management
- Employee management
- Role definitions
- Order creation
- Inventory updates
- Customer order tracking
- Organization order management
- Subscription display
- Customer marketplace interface

---

## 👨‍💻 Development

Built as a multi-tenant full-stack assessment project using:

**React + Node.js + Express + PostgreSQL + Neon**

The project demonstrates database isolation, authentication, role-based application design, product management, order processing, and customer purchasing workflows.
## Latest Implementation & Testing

### Completed Today

- Implemented organization-based multi-tenant architecture using Neon PostgreSQL.
- Created a separate PostgreSQL database for each organization with required tenant tables.
- Implemented organization Admin authentication and JWT-based authorization.
- Implemented employee authentication with role-based access:
  - Admin
  - Inventory Manager
  - Account Manager
- Implemented role-specific dashboards and access restrictions.
- Inventory Manager:
  - Product create, read, update and delete
  - Public/private product control
  - Read-only order access
- Account Manager:
  - Read-only product access
  - Order viewing and order status updates
- Admin:
  - Full product and order access
  - Employee and role management
- Implemented customer signup/signin.
- Implemented public organization marketplace.
- Implemented customer product browsing and purchasing.
- Implemented order creation, inventory deduction and order tracking.
- Implemented customer order tracking.
- Tested the complete customer purchase flow.
- Tested Account Manager order status update.
- Tested Inventory Manager product management.
- Configured Neon organization/project access and invited the mentor to the Neon organization for project/database review.

### Final Verification

The application was tested across the main user flows:

- Organization signup/signin
- Admin dashboard
- Employee role management
- Inventory Manager dashboard
- Account Manager dashboard
- Product management
- Customer registration/login
- Customer marketplace
- Product purchase
- Order processing
- Customer order tracking
- Neon PostgreSQL tenant database setup