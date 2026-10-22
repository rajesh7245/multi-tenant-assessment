const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
      email,
      password
    } = req.body;

    // Validate required fields
    if (
      !organizationId ||
      !organizationName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message:
          "Organization ID, organization name, email and password are required"
      });
    }

    // Check duplicate Organization ID
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

    // Check duplicate Organization Name
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

    // Create organization in master database
    const tenantResult = await pool.query(
      `INSERT INTO tenants
       (organization_id, name)
       VALUES ($1, $2)
       RETURNING id, organization_id, name`,
      [organizationId, organizationName]
    );

    const tenant = tenantResult.rows[0];

    // Generate separate database for this organization
    const databaseName = `tenant_${tenant.id}`;

    // Create tenant database and all required tables
    await createTenantDatabase(databaseName);

    // Save tenant database name in master database
    await pool.query(
      `UPDATE tenants
       SET database_name = $1
       WHERE id = $2`,
      [databaseName, tenant.id]
    );

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create master/admin user
    const userResult = await pool.query(
      `INSERT INTO users
       (tenant_id, name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, tenant_id, name, email, role`,
      [
        tenant.id,
        organizationName,
        email,
        passwordHash,
        "admin"
      ]
    );

    // Create 14-day trial subscription
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

    // Successful signup response
    res.status(201).json({
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

    res.status(500).json({
      message: "Signup failed",
      error: error.message
    });
  }
}


// =========================
// SIGNIN
// =========================

async function signin(req, res) {
  try {
    const {
      organizationId,
      email,
      password
    } = req.body;

    // Validate required fields
    if (!organizationId || !email || !password) {
      return res.status(400).json({
        message:
          "Organization ID, email and password are required"
      });
    }

    // Find organization and user
    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.password_hash,
        u.role,

        t.id AS tenant_id,
        t.organization_id,
        t.name AS organization_name,
        t.database_name

       FROM users u

       INNER JOIN tenants t
         ON t.id = u.tenant_id

       WHERE t.organization_id = $1
         AND u.email = $2`,
      [
        organizationId,
        email
      ]
    );

    // Organization/user not found
    if (result.rows.length === 0) {
      return res.status(401).json({
        message:
          "Invalid organization ID, email or password"
      });
    }

    const user = result.rows[0];

    // Check password
    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        message:
          "Invalid organization ID, email or password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        organizationId: user.organization_id,
        role: user.role
      },

      process.env.JWT_SECRET || "assessment-secret",

      {
        expiresIn: "8h"
      }
    );

    // Successful signin response
    res.status(200).json({
      message: "Signin successful",

      token,

      user: {
  id: user.id,
  tenantId: user.tenant_id,
  name: user.name,
  email: user.email,
  role: user.role,
        organizationId:
          user.organization_id,

        organizationName:
          user.organization_name,

        databaseName:
          user.database_name
      }
    });

  } catch (error) {
    console.error("Signin error:", error);

    res.status(500).json({
      message: "Signin failed",
      error: error.message
    });
  }
}

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

    res.json({
      subscription: result.rows[0]
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    res.status(500).json({
      message: "Failed to get subscription",
      error: error.message
    });
  }
}
// =========================
// EXPORTS
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

    res.json({
      organizations: result.rows
    });
  } catch (error) {
    console.error("Get organizations error:", error);

    res.status(500).json({
      message: "Failed to get organizations",
      error: error.message
    });
  }
}
module.exports = {
  signup,
  signin,
  getSubscription,
  getOrganizations
};
