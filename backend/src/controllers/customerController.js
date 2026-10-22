const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// CUSTOMER SIGNUP
async function customerSignup(req, res) {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingCustomer = await pool.query(
      `SELECT id
       FROM customers
       WHERE email = $1`,
      [email]
    );

    if (existingCustomer.rows.length > 0) {
      return res.status(409).json({
        message: "Customer email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO customers
       (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [
        name,
        email,
        passwordHash
      ]
    );

    const customer = result.rows[0];

    const token = jwt.sign(
      {
        customerId: customer.id,
        type: "customer"
      },
      process.env.JWT_SECRET || "assessment-secret",
      {
        expiresIn: "8h"
      }
    );

    res.status(201).json({
      message: "Customer signup successful",
      token,
      customer
    });

  } catch (error) {
    console.error("Customer signup error:", error);

    res.status(500).json({
      message: "Customer signup failed",
      error: error.message
    });
  }
}


// CUSTOMER SIGNIN
async function customerSignin(req, res) {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        created_at
       FROM customers
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const customer = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        customerId: customer.id,
        type: "customer"
      },
      process.env.JWT_SECRET || "assessment-secret",
      {
        expiresIn: "8h"
      }
    );

    res.status(200).json({
      message: "Customer signin successful",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        created_at: customer.created_at
      }
    });

  } catch (error) {
    console.error("Customer signin error:", error);

    res.status(500).json({
      message: "Customer signin failed",
      error: error.message
    });
  }
}


module.exports = {
  customerSignup,
  customerSignin
};