const { Client } = require("pg");
const jwt = require("jsonwebtoken");

async function getTenantClient(databaseName) {
  if (!databaseName) {
    throw new Error("databaseName is required");
  }

  const baseUrl = new URL(process.env.DATABASE_URL);
  baseUrl.pathname = `/${databaseName}`;

  const client = new Client({
    connectionString: baseUrl.toString(),
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();
  return client;
}


// =========================
// GET JWT DATA
// =========================

function getJwtData(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.split(" ")[1];

    return jwt.verify(
      token,
      process.env.JWT_SECRET || "assessment-secret"
    );
  } catch (error) {
    return null;
  }
}


// =========================
// GET USER ROLE
// =========================

function getUserRole(req) {
  const decoded = getJwtData(req);
  return decoded?.role || null;
}


// =========================
// CHECK PRODUCT WRITE ACCESS
// =========================

function canManageProducts(req) {
  const role = getUserRole(req);

  return (
    role === "admin" ||
    role === "Inventory Manager"
  );
}


// =========================
// CREATE PRODUCT
// =========================

async function createProduct(req, res) {
  const {
    databaseName,
    name,
    description,
    price,
    quantity,
    isPublic
  } = req.body;

  if (
    !databaseName ||
    !name ||
    price === undefined ||
    quantity === undefined
  ) {
    return res.status(400).json({
      message:
        "databaseName, name, price and quantity are required"
    });
  }

  if (!canManageProducts(req)) {
    return res.status(403).json({
      message:
        "Access denied. Only Admin or Inventory Manager can create products."
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      `INSERT INTO products
       (
         name,
         description,
         price,
         quantity,
         is_public
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4,
         $5
       )
       RETURNING *`,
      [
        name,
        description || null,
        price,
        quantity,
        isPublic === true
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// GET PRODUCTS
// =========================

async function getProducts(req, res) {
  const { databaseName } = req.query;

  if (!databaseName) {
    return res.status(400).json({
      message: "databaseName is required"
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const jwtData = getJwtData(req);

    // Customers can see ONLY public products.
    const isCustomer = jwtData?.type === "customer";

    const query = isCustomer
      ? `SELECT *
         FROM products
         WHERE is_public = true
         ORDER BY id DESC`
      : `SELECT *
         FROM products
         ORDER BY id DESC`;

    const result = await client.query(query);

    res.json({
      products: result.rows
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to get products",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// UPDATE PRODUCT
// =========================

async function updateProduct(req, res) {
  const { databaseName } = req.body;
  const { id } = req.params;

  const {
    name,
    description,
    price,
    quantity,
    isPublic
  } = req.body;

  if (!databaseName) {
    return res.status(400).json({
      message: "databaseName is required"
    });
  }

  if (!canManageProducts(req)) {
    return res.status(403).json({
      message:
        "Access denied. Only Admin or Inventory Manager can update products."
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      `UPDATE products
       SET
         name = $1,
         description = $2,
         price = $3,
         quantity = $4,
         is_public = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        name,
        description || null,
        price,
        quantity,
        isPublic === true,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// DELETE PRODUCT
// =========================

async function deleteProduct(req, res) {
  const { databaseName } = req.query;
  const { id } = req.params;

  if (!databaseName) {
    return res.status(400).json({
      message: "databaseName is required"
    });
  }

  if (!canManageProducts(req)) {
    return res.status(403).json({
      message:
        "Access denied. Only Admin or Inventory Manager can delete products."
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      `DELETE FROM products
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product deleted successfully",
      product: result.rows[0]
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
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
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};