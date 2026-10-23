const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Client } = require("pg");

const pool = require("../config/db");
const { createTenantDatabase } = require("../config/createTenantDatabase");


// =========================
// SIGNUP
// =========================

async function signup(req, res) {
  try {
    const {
      organizationId,
      organizationName,
      name,
      email,
      password
    } = req.body;

    if (
      !organizationId ||
      !organizationName ||
      !name ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Organization ID, organization name, admin name, email and password are required"
      });
    }

    if (!/^[A-Za-z0-9]+$/.test(organizationId)) {
      return res.status(400).json({
        message:
          "Organization ID must contain only letters and numbers"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters long"
      });
    }

    const organizationIdCheck = await pool.query(
      `SELECT id
       FROM tenants
       WHERE organization_id = $1`,
      [organizationId]
    );

    if (organizationIdCheck.rows.length > 0) {
      return res.status(409).json({
        message: "Organization ID already exists"
      });
    }

    const organizationNameCheck = await pool.query(
      `SELECT id
       FROM tenants
       WHERE name = $1`,
      [organizationName]
    );

    if (organizationNameCheck.rows.length > 0) {
      return res.status(409).json({
        message: "Organization name already exists"
      });
    }

    const tenantResult = await pool.query(
      `INSERT INTO tenants
       (organization_id, name)
       VALUES ($1, $2)
       RETURNING id, organization_id, name`,
      [organizationId, organizationName]
    );

    const tenant = tenantResult.rows[0];

    const databaseName = `tenant_${tenant.id}`;

    await createTenantDatabase(databaseName);

    await pool.query(
      `UPDATE tenants
       SET database_name = $1
       WHERE id = $2`,
      [databaseName, tenant.id]
    );

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users
       (tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, tenant_id, name, email, role`,
      [
        tenant.id,
        name,
        email,
        passwordHash,
        "admin"
      ]
    );

    await pool.query(
      `INSERT INTO subscriptions
       (
         tenant_id,
         master_user_id,
         plan,
         status,
         trial_start,
         trial_end
       )
       VALUES
       (
         $1,
         $2,
         $3,
         $4,
         CURRENT_TIMESTAMP,
         CURRENT_TIMESTAMP + INTERVAL '14 days'
       )`,
      [
        tenant.id,
        userResult.rows[0].id,
        "TRIAL",
        "ACTIVE"
      ]
    );

    return res.status(201).json({
      message:
        "Organization, database, tables, user and trial subscription created successfully",

      tenant: {
        id: tenant.id,
        organization_id: tenant.organization_id,
        name: tenant.name,
        database_name: databaseName
      },

      user: userResult.rows[0],

      subscription: {
        plan: "TRIAL",
        status: "ACTIVE",
        trial_days: 14
      }
    });

  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
}


// =========================
// SIGNIN
// Supports:
// Admin
// Inventory Manager
// Account Manager
// =========================

async function signin(req, res) {
  try {
    const {
      organizationId,
      email,
      password
    } = req.body;

    if (
      !organizationId ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Organization ID, email and password are required"
      });
    }

    if (!/^[A-Za-z0-9]+$/.test(organizationId)) {
      return res.status(400).json({
        message:
          "Organization ID must contain only letters and numbers"
      });
    }


    // =========================
    // FIND ORGANIZATION
    // =========================

    const tenantResult = await pool.query(
      `SELECT
        id,
        organization_id,
        name,
        database_name
       FROM tenants
       WHERE organization_id = $1`,
      [organizationId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(401).json({
        message:
          "Invalid organization ID, email or password"
      });
    }

    const tenant = tenantResult.rows[0];


    // =========================
    // CHECK ADMIN LOGIN
    // =========================

    const adminResult = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        role
       FROM users
       WHERE tenant_id = $1
         AND email = $2`,
      [
        tenant.id,
        email
      ]
    );

    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];

      const passwordValid = await bcrypt.compare(
        password,
        admin.password_hash
      );

      if (!passwordValid) {
        return res.status(401).json({
          message:
            "Invalid organization ID, email or password"
        });
      }

      const token = jwt.sign(
        {
          userId: admin.id,
          tenantId: tenant.id,
          organizationId: tenant.organization_id,
          role: admin.role || "admin"
        },
        process.env.JWT_SECRET || "assessment-secret",
        {
          expiresIn: "8h"
        }
      );

      return res.status(200).json({
        message: "Signin successful",

        token,

        user: {
          id: admin.id,
          tenantId: tenant.id,
          name: admin.name,
          email: admin.email,
          role: admin.role || "admin",
          organizationId: tenant.organization_id,
          organizationName: tenant.name,
          databaseName: tenant.database_name
        }
      });
    }


    // =========================
    // CHECK EMPLOYEE LOGIN
    // =========================

    if (!tenant.database_name) {
      return res.status(500).json({
        message:
          "Organization database is not configured"
      });
    }

    const baseUrl = new URL(
      process.env.DATABASE_URL
    );

    baseUrl.pathname =
      `/${tenant.database_name}`;

    const client = new Client({
      connectionString: baseUrl.toString(),
      ssl: {
        rejectUnauthorized: false
      }
    });

    try {
      await client.connect();

      const employeeResult = await client.query(
        `SELECT
          e.id,
          e.name,
          e.email,
          e.password_hash,
          e.role_id,
          r.name AS role_name
         FROM employees e
         INNER JOIN roles r
           ON r.id = e.role_id
         WHERE e.email = $1`,
        [email]
      );

      if (employeeResult.rows.length === 0) {
        return res.status(401).json({
          message:
            "Invalid organization ID, email or password"
        });
      }

      const employee =
        employeeResult.rows[0];

      const passwordValid =
        await bcrypt.compare(
          password,
          employee.password_hash
        );

      if (!passwordValid) {
        return res.status(401).json({
          message:
            "Invalid organization ID, email or password"
        });
      }


      // =========================
      // ONLY ALLOW VALID ROLES
      // =========================

      const allowedRoles = [
        "Inventory Manager",
        "Account Manager"
      ];

      if (
        !allowedRoles.includes(
          employee.role_name
        )
      ) {
        return res.status(403).json({
          message:
            "Employee role is not authorized"
        });
      }


      // =========================
      // CREATE EMPLOYEE JWT
      // =========================

      const token = jwt.sign(
        {
          userId: employee.id,
          tenantId: tenant.id,
          organizationId:
            tenant.organization_id,
          role: employee.role_name,
          type: "staff"
        },
        process.env.JWT_SECRET ||
          "assessment-secret",
        {
          expiresIn: "8h"
        }
      );


      // =========================
      // SUCCESS
      // =========================

      return res.status(200).json({
        message: "Signin successful",

        token,

        user: {
          id: employee.id,
          tenantId: tenant.id,
          name: employee.name,
          email: employee.email,
          role: employee.role_name,
          organizationId:
            tenant.organization_id,
          organizationName: tenant.name,
          databaseName:
            tenant.database_name
        }
      });

    } finally {
      await client.end();
    }

  } catch (error) {
    console.error(
      "Signin error:",
      error
    );

    return res.status(500).json({
      message: "Signin failed",
      error: error.message
    });
  }
}


// =========================
// GET SUBSCRIPTION
// =========================

async function getSubscription(req, res) {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        message: "tenantId is required"
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        plan,
        status,
        trial_start,
        trial_end,
        created_at,
        updated_at
       FROM subscriptions
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Subscription not found"
      });
    }

    return res.json({
      subscription: result.rows[0]
    });

  } catch (error) {
    console.error(
      "Get subscription error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get subscription",
      error: error.message
    });
  }
}


// =========================
// GET ORGANIZATIONS
// =========================

async function getOrganizations(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        id,
        organization_id,
        name,
        database_name,
        created_at
       FROM tenants
       WHERE database_name IS NOT NULL
       ORDER BY name ASC`
    );

    return res.json({
      organizations: result.rows
    });

  } catch (error) {
    console.error(
      "Get organizations error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get organizations",
      error: error.message
    });
  }
}


// =========================
// EXPORTS
// =========================

module.exports = {
  signup,
  signin,
  getSubscription,
  getOrganizations
};