const { Pool } = require("pg");

/*
  Creates all tables and default roles required
  by one organization's tenant database.
*/

async function createTenantTables(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await pool.query(`
      /* =========================
         ROLES
         ========================= */

      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      );


      /* =========================
         EMPLOYEES
         ========================= */

      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );


      /* =========================
         PRODUCTS
         ========================= */

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price NUMERIC(12,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        is_public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      /* Add public flag to existing tenant databases */
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE;


      /* =========================
         ORDERS
         ========================= */

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER,
        customer_name VARCHAR(150) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
        status VARCHAR(50) NOT NULL DEFAULT 'PLACED',
        total_amount NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      /* Add customer_id to existing tenant databases */
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_id INTEGER;

      /* Add payment_method to existing tenant databases */
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)
      NOT NULL DEFAULT 'Cash on Delivery';


      /* =========================
         ORDER ITEMS
         ========================= */

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL
          REFERENCES orders(id)
          ON DELETE CASCADE,
        product_id INTEGER NOT NULL
          REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(12,2) NOT NULL
      );


      /* =========================
         PERMISSIONS
         ========================= */

      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      );


      /* =========================
         ROLE PERMISSIONS
         ========================= */

      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL
          REFERENCES roles(id)
          ON DELETE CASCADE,

        permission_id INTEGER NOT NULL
          REFERENCES permissions(id)
          ON DELETE CASCADE,

        PRIMARY KEY (role_id, permission_id)
      );


      /* =========================
         DEFAULT ROLES
         ========================= */

      INSERT INTO roles (name, description)
      VALUES
        (
          'Inventory Manager',
          'Can create, update and delete products, manage product visibility and view orders'
        ),
        (
          'Account Manager',
          'Can view products and view/update customer orders'
        )
      ON CONFLICT (name) DO NOTHING;


      /* =========================
         DEFAULT PERMISSIONS
         ========================= */

      INSERT INTO permissions (name, description)
      VALUES
        (
          'product_create',
          'Create products'
        ),
        (
          'product_read',
          'View products'
        ),
        (
          'product_update',
          'Update products'
        ),
        (
          'product_delete',
          'Delete products'
        ),
        (
          'order_read',
          'View orders'
        ),
        (
          'order_update',
          'Update order status'
        )
      ON CONFLICT (name) DO NOTHING;


      /* =========================
         INVENTORY MANAGER
         ========================= */

      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.name = 'Inventory Manager'
        AND p.name IN (
          'product_create',
          'product_read',
          'product_update',
          'product_delete',
          'order_read'
        )
      ON CONFLICT DO NOTHING;


      /* =========================
         ACCOUNT MANAGER
         ========================= */

      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.name = 'Account Manager'
        AND p.name IN (
          'product_read',
          'order_read',
          'order_update'
        )
      ON CONFLICT DO NOTHING;
    `);

    console.log(
      "Tenant tables, roles and permissions created successfully."
    );

  } catch (error) {
    console.error(
      "Error creating tenant tables:",
      error
    );

    throw error;

  } finally {
    await pool.end();
  }
}

module.exports = {
  createTenantTables,
};