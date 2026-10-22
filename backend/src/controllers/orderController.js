const { Client } = require("pg");

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

// CREATE ORDER
async function createOrder(req, res) {
  let client;

  try {
    const {
      databaseName,
      customerName,
      customerEmail,
      address,
      totalAmount
    } = req.body;

    if (
      !databaseName ||
      !customerName ||
      !customerEmail ||
      !address ||
      totalAmount === undefined
    ) {
      return res.status(400).json({
        message: "All order fields are required"
      });
    }

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `INSERT INTO orders
       (customer_name, customer_email, address, status, total_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customerName,
        customerEmail,
        address,
        "pending",
        totalAmount
      ]
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// GET ALL ORDERS
async function getOrders(req, res) {
  let client;

  try {
    const { databaseName } = req.query;

    if (!databaseName) {
      return res.status(400).json({
        message: "databaseName is required"
      });
    }

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `SELECT *
       FROM orders
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      orders: result.rows
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Failed to get orders",
      error: error.message
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// GET ONE ORDER
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

    client = getTenantClient(databaseName);

    await client.connect();

    const result = await client.query(
      `SELECT *
       FROM orders
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Failed to get order",
      error: error.message
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}

// UPDATE ORDER STATUS
async function updateOrderStatus(req, res) {
  let client;

  try {
    const { id } = req.params;
    const { databaseName, status } = req.body;

    if (!databaseName || !status) {
      return res.status(400).json({
        message: "databaseName and status are required"
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
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order: result.rows[0]
    });
  } catch (error) {
    console.error("Update order error:", error);

    return res.status(500).json({
      message: "Failed to update order",
      error: error.message
    });
  } finally {
    if (client) {
      await client.end();
    }
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus
};