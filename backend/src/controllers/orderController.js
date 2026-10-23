const { Client } = require("pg");
const jwt = require("jsonwebtoken");

const masterPool = require("../config/db");

// =========================
// TENANT CLIENT
// =========================

function getTenantClient(databaseName) {
  if (!databaseName) {
    throw new Error("databaseName is required");
  }

  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${databaseName}`;

  return new Client({
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: false
    }
  });
}

// =========================
// GET STAFF FROM TOKEN
// =========================

function getStaffFromToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Staff authentication required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "assessment-secret"
    );
  } catch (error) {
    throw new Error("Invalid staff token");
  }

  if (
    !decoded ||
    !decoded.role ||
    decoded.type === "customer"
  ) {
    throw new Error("Invalid staff token");
  }

  return decoded;
}

// =========================
// VERIFY STAFF TENANT ACCESS
// =========================

async function verifyStaffTenantAccess(staff, databaseName) {
  if (!staff.tenantId) {
    throw new Error("Invalid staff tenant");
  }

  const result = await masterPool.query(
    `SELECT database_name
     FROM tenants
     WHERE id = $1`,
    [staff.tenantId]
  );

  if (result.rows.length === 0) {
    throw new Error("Organization not found");
  }

  if (result.rows[0].database_name !== databaseName) {
    throw new Error("Unauthorized organization access");
  }
}

// =========================
// GET CUSTOMER FROM TOKEN
// =========================

function getCustomerFromToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Customer authentication required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "assessment-secret"
    );
  } catch (error) {
    throw new Error("Invalid customer token");
  }

  if (
    decoded.type !== "customer" ||
    !decoded.customerId
  ) {
    throw new Error("Invalid customer token");
  }

  return decoded.customerId;
}

// =========================
// CUSTOMER CREATES ORDER
// =========================

async function createOrder(req, res) {
  let client;

  try {
    const {
      databaseName,
      productId,
      quantity,
      address,
      paymentMethod
    } = req.body;

    if (
      !databaseName ||
      !productId ||
      !quantity ||
      !address ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message:
          "databaseName, productId, quantity, address and paymentMethod are required"
      });
    }

    const customerId = getCustomerFromToken(req);

    const customerResult = await masterPool.query(
      `SELECT id, name, email
       FROM customers
       WHERE id = $1`,
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    const customer = customerResult.rows[0];

    client = getTenantClient(databaseName);

    await client.connect();

    // Ensure older tenant databases have all required order columns.
    await client.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS customer_id INTEGER,
      ADD COLUMN IF NOT EXISTS customer_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
      ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    `);

    await client.query(`
      ALTER TABLE order_items
      ADD COLUMN IF NOT EXISTS order_id INTEGER,
      ADD COLUMN IF NOT EXISTS product_id INTEGER,
      ADD COLUMN IF NOT EXISTS quantity INTEGER,
      ADD COLUMN IF NOT EXISTS price NUMERIC(12,2)
    `);

    await client.query("BEGIN");

    const productResult = await client.query(
      `SELECT id, name, price, quantity
       FROM products
       WHERE id = $1
       FOR UPDATE`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found"
      });
    }

    const product = productResult.rows[0];

    const requestedQuantity = Number(quantity);
    const availableQuantity = Number(product.quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity <= 0
    ) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    if (availableQuantity < requestedQuantity) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: `Only ${availableQuantity} item(s) available`
      });
    }

    const totalAmount =
      Number(product.price) * requestedQuantity;

    const orderResult = await client.query(
      `INSERT INTO orders
       (
         customer_id,
         customer_name,
         customer_email,
         address,
         payment_method,
         status,
         total_amount
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        customer.id,
        customer.name,
        customer.email,
        address,
        paymentMethod,
        "pending",
        totalAmount
      ]
    );

    const order = orderResult.rows[0];

    await client.query(
      `INSERT INTO order_items
       (
         order_id,
         product_id,
         quantity,
         price
       )
       VALUES ($1, $2, $3, $4)`,
      [
        order.id,
        product.id,
        requestedQuantity,
        product.price
      ]
    );

    await client.query(
      `UPDATE products
       SET quantity = quantity - $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [
        requestedQuantity,
        product.id
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        ...order,
        product_name: product.name,
        product_id: product.id,
        quantity: requestedQuantity
      }
    });

  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch {}
    }

    console.error("Create order error:", error);

    if (
      error.message === "Customer authentication required" ||
      error.message === "Invalid customer token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}

// =========================
// ORGANIZATION STAFF GET ORDERS
// Inventory Manager: READ
// Account Manager: READ
// Admin: READ
// =========================

async function getOrders(req, res) {
  let client;

  try {
    const { databaseName } = req.query;

    if (!databaseName) {
      return res.status(400).json({
        message: "databaseName is required"
      });
    }

    const staff = getStaffFromToken(req);

    if (
      staff.role !== "admin" &&
      staff.role !== "Inventory Manager" &&
      staff.role !== "Account Manager"
    ) {
      return res.status(403).json({
        message: "You do not have permission to view orders"
      });
    }

    await verifyStaffTenantAccess(
      staff,
      databaseName
    );

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `SELECT
         o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi
         ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      orders: result.rows
    });

  } catch (error) {
    console.error("Get orders error:", error);

    if (
      error.message === "Staff authentication required" ||
      error.message === "Invalid staff token" ||
      error.message === "Invalid staff tenant" ||
      error.message === "Organization not found"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    if (
      error.message === "Unauthorized organization access"
    ) {
      return res.status(403).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to get orders",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}

// =========================
// GET SINGLE ORDER
// =========================

async function getOrder(req, res) {
  let client;

  try {
    const { id } = req.params;
    const { databaseName } = req.query;

    if (!databaseName) {
      return res.status(400).json({
        message: "databaseName is required"
      });
    }

    const staff = getStaffFromToken(req);

    if (
      staff.role !== "admin" &&
      staff.role !== "Inventory Manager" &&
      staff.role !== "Account Manager"
    ) {
      return res.status(403).json({
        message: "You do not have permission to view orders"
      });
    }

    await verifyStaffTenantAccess(
      staff,
      databaseName
    );

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `SELECT
         o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'product_id', oi.product_id,
               'quantity', oi.quantity,
               'price', oi.price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi
         ON oi.order_id = o.id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      order: result.rows[0]
    });

  } catch (error) {
    console.error("Get order error:", error);

    if (
      error.message === "Staff authentication required" ||
      error.message === "Invalid staff token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    if (
      error.message === "Unauthorized organization access"
    ) {
      return res.status(403).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to get order",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}

// =========================
// UPDATE ORDER STATUS
// Account Manager: UPDATE
// Admin: UPDATE
// Inventory Manager: READ ONLY
// =========================

async function updateOrderStatus(req, res) {
  let client;

  try {
    const { id } = req.params;
    const { databaseName, status } = req.body;

    const staff = getStaffFromToken(req);

    if (
      staff.role !== "admin" &&
      staff.role !== "Account Manager"
    ) {
      return res.status(403).json({
        message:
          "Only Admin or Account Manager can update order status"
      });
    }

    if (!databaseName || !status) {
      return res.status(400).json({
        message:
          "databaseName and status are required"
      });
    }

    await verifyStaffTenantAccess(
      staff,
      databaseName
    );

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered"
    ];

    const normalizedStatus =
      String(status).toLowerCase();

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        message:
          "Invalid status. Use pending, processing, shipped or delivered"
      });
    }

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `UPDATE orders
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [
        normalizedStatus,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json({
      message: "Order status updated successfully",
      order: result.rows[0]
    });

  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    if (
      error.message === "Staff authentication required" ||
      error.message === "Invalid staff token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    if (
      error.message === "Unauthorized organization access"
    ) {
      return res.status(403).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}

// =========================
// CUSTOMER ORDER TRACKING
// =========================

async function getCustomerOrders(req, res) {
  let client;

  try {
    const { databaseName } = req.query;

    if (!databaseName) {
      return res.status(400).json({
        message: "databaseName is required"
      });
    }

    const customerId = getCustomerFromToken(req);

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `SELECT
         o.id,
         o.customer_id,
         o.customer_name,
         o.customer_email,
         o.address,
         o.payment_method,
         o.status,
         o.total_amount,
         o.created_at,
         o.updated_at,

         COALESCE(
           json_agg(
             json_build_object(
               'product_id', oi.product_id,
               'product_name', p.name,
               'product_description', p.description,
               'quantity', oi.quantity,
               'price', oi.price,
               'line_total', oi.quantity * oi.price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items

       FROM orders o

       LEFT JOIN order_items oi
         ON oi.order_id = o.id

       LEFT JOIN products p
         ON p.id = oi.product_id

       WHERE o.customer_id = $1

       GROUP BY o.id

       ORDER BY o.created_at DESC`,
      [customerId]
    );

    res.json({
      orders: result.rows
    });

  } catch (error) {
    console.error(
      "Get customer orders error:",
      error
    );

    if (
      error.message === "Customer authentication required" ||
      error.message === "Invalid customer token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to get customer orders",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}

// =========================
// EXPORTS
// =========================

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getCustomerOrders
};