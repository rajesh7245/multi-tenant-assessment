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


// =========================
// GET ROLES
// =========================

async function getRoles(req, res) {
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
       FROM roles
       ORDER BY id ASC`
    );

    res.json({
      roles: result.rows
    });

  } catch (error) {
    console.error("Get roles error:", error);

    res.status(500).json({
      message: "Failed to get roles",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// CREATE EMPLOYEE
// =========================

async function createEmployee(req, res) {
  let client;

  try {
    const {
      databaseName,
      name,
      email,
      password,
      roleId
    } = req.body;

    if (
      !databaseName ||
      !name ||
      !email ||
      !password ||
      !roleId
    ) {
      return res.status(400).json({
        message: "All employee fields are required"
      });
    }

    client = getTenantClient(databaseName);
    await client.connect();

    const bcrypt = require("bcrypt");

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO employees
       (name, email, password_hash, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role_id, created_at`,
      [
        name,
        email,
        passwordHash,
        roleId
      ]
    );

    res.status(201).json({
      message: "Employee created successfully",
      employee: result.rows[0]
    });

  } catch (error) {
    console.error("Create employee error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Employee email already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create employee",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// GET EMPLOYEES
// =========================

async function getEmployees(req, res) {
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
      `SELECT
        e.id,
        e.name,
        e.email,
        e.role_id,
        r.name AS role_name,
        r.description AS role_description,
        e.created_at
       FROM employees e
       LEFT JOIN roles r
         ON r.id = e.role_id
       ORDER BY e.created_at DESC`
    );

    res.json({
      employees: result.rows
    });

  } catch (error) {
    console.error("Get employees error:", error);

    res.status(500).json({
      message: "Failed to get employees",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


// =========================
// DELETE EMPLOYEE
// =========================

async function deleteEmployee(req, res) {
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
      `DELETE FROM employees
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.json({
      message: "Employee deleted successfully",
      employee: result.rows[0]
    });

  } catch (error) {
    console.error("Delete employee error:", error);

    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message
    });

  } finally {
    if (client) {
      await client.end();
    }
  }
}


module.exports = {
  getRoles,
  createEmployee,
  getEmployees,
  deleteEmployee
};