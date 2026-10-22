
const { Client } = require("pg");

async function getTenantClient(databaseName) {
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

async function createProduct(req, res) {
  const { databaseName, name, description, price, quantity } = req.body;

  if (!databaseName || !name || price === undefined || quantity === undefined) {
    return res.status(400).json({
      message: "databaseName, name, price and quantity are required"
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      `INSERT INTO products (name, description, price, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, price, quantity]
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

    const result = await client.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

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

async function updateProduct(req, res) {
  const { databaseName } = req.body;
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;

  if (!databaseName) {
    return res.status(400).json({
      message: "databaseName is required"
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           quantity = $4
       WHERE id = $5
       RETURNING *`,
      [name, description || null, price, quantity, id]
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

async function deleteProduct(req, res) {
  // DELETE receives databaseName from the query string:
  // /api/products/1?databaseName=tenant_6
  const { databaseName } = req.query;
  const { id } = req.params;

  if (!databaseName) {
    return res.status(400).json({
      message: "databaseName is required"
    });
  }

  let client;

  try {
    client = await getTenantClient(databaseName);

    const result = await client.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
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

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
};
