
const { Client } = require("pg");
const jwt = require("jsonwebtoken");
const masterPool = require("../config/db");

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

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "assessment-secret"
    );

    if (!decoded || !decoded.role || !decoded.tenantId) {
      throw new Error("Invalid staff token");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid staff token");
  }
}

// =========================
// VERIFY ADMIN + TENANT
// =========================

async function verifyAdminTenantAccess(req, databaseName) {
  const staff = getStaffFromToken(req);

  if (staff.role !== "admin") {
    throw new Error("Only Admin can manage employees");
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

  return staff;
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
// ADMIN ONLY
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

    // IMPORTANT: Only Admin can create employees
    await verifyAdminTenantAccess(req, databaseName);

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

    if (error.message === "Staff authentication required") {
      return res.status(401).json({
        message: error.message
      });
    }

    if (error.message === "Invalid staff token") {
      return res.status(401).json({
        message: error.message
      });
    }

    if (error.message === "Only Admin can manage employees") {
      return res.status(403).json({
        message: error.message
      });
    }

    if (error.message === "Organization not found") {
      return res.status(401).json({
        message: error.message
      });
    }

    if (error.message === "Unauthorized organization access") {
      return res.status(403).json({
        message: error.message
      });
    }

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

    const staff = getStaffFromToken(req);

    // Only users belonging to this organization can view employees
    const tenantResult = await masterPool.query(
      `SELECT database_name
       FROM tenants
       WHERE id = $1`,
      [staff.tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(401).json({
        message: "Organization not found"
      });
    }

    if (tenantResult.rows[0].database_name !== databaseName) {
      return res.status(403).json({
        message: "Unauthorized organization access"
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

    if (
      error.message === "Staff authentication required" ||
      error.message === "Invalid staff token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

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
// ADMIN ONLY
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

    // IMPORTANT: Only Admin can delete employees
    await verifyAdminTenantAccess(req, databaseName);

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

    if (
      error.message === "Staff authentication required" ||
      error.message === "Invalid staff token"
    ) {
      return res.status(401).json({
        message: error.message
      });
    }

    if (error.message === "Only Admin can manage employees") {
      return res.status(403).json({
        message: error.message
      });
    }

    if (error.message === "Organization not found") {
      return res.status(401).json({
        message: error.message
      });
    }

    if (error.message === "Unauthorized organization access") {
      return res.status(403).json({
        message: error.message
      });
    }

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
