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

    // Free plan with 7-day trial
    const trialStart = new Date();
    const trialEnd = new Date(trialStart);

    trialEnd.setDate(
      trialEnd.getDate() + 7
    );

    const result = await pool.query(
      `INSERT INTO customers
       (
         name,
         email,
         password_hash,
         subscription_plan_id,
         subscription_status,
         trial_start,
         trial_end,
         payment_status
       )
       VALUES ($1, $2, $3, 1, 'trial', $4, $5, 'not_required')
       RETURNING
         id,
         name,
         email,
         created_at,
         subscription_plan_id,
         subscription_status,
         trial_start,
         trial_end,
         subscription_start,
         subscription_end,
         payment_status`,
      [
        name,
        email,
        passwordHash,
        trialStart,
        trialEnd
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
    console.error(
      "Customer signup error:",
      error
    );

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
        created_at,
        subscription_plan_id,
        subscription_status,
        trial_start,
        trial_end,
        subscription_start,
        subscription_end,
        payment_status,
        password_hash
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

    // Get the selected subscription plan
    let subscriptionPlan = null;

    if (customer.subscription_plan_id) {
      const planResult = await pool.query(
        `SELECT
          id,
          name,
          price,
          duration_days,
          trial_days,
          features
         FROM subscription_plans
         WHERE id = $1`,
        [customer.subscription_plan_id]
      );

      if (planResult.rows.length > 0) {
        subscriptionPlan = planResult.rows[0];
      }
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
        created_at: customer.created_at,
        subscription_plan_id:
          customer.subscription_plan_id,
        subscription_status:
          customer.subscription_status,
        trial_start: customer.trial_start,
        trial_end: customer.trial_end,
        subscription_start:
          customer.subscription_start,
        subscription_end:
          customer.subscription_end,
        payment_status:
          customer.payment_status,
        subscriptionPlan
      }
    });

  } catch (error) {
    console.error(
      "Customer signin error:",
      error
    );

    res.status(500).json({
      message: "Customer signin failed",
      error: error.message
    });
  }
}


// CUSTOMER PREMIUM SUBSCRIPTION
async function subscribeCustomer(req, res) {
  try {
    const { customerId, planId } = req.body;

    if (!customerId || !planId) {
      return res.status(400).json({
        message: "Customer ID and plan ID are required"
      });
    }

    const planResult = await pool.query(
      `SELECT
        id,
        name,
        price,
        duration_days,
        trial_days,
        features
       FROM subscription_plans
       WHERE id = $1`,
      [planId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        message: "Subscription plan not found"
      });
    }

    const plan = planResult.rows[0];

    const now = new Date();

    const trialEnd = new Date(now);

    trialEnd.setDate(
      trialEnd.getDate() + plan.trial_days
    );

    const subscriptionEnd = new Date(now);

    subscriptionEnd.setDate(
      subscriptionEnd.getDate() +
      plan.duration_days
    );

    const result = await pool.query(
      `UPDATE customers
       SET
         subscription_plan_id = $1,
         subscription_status = 'active',
         trial_start = $2,
         trial_end = $3,
         subscription_start = $2,
         subscription_end = $4,
         payment_status = 'paid'
       WHERE id = $5
       RETURNING
         id,
         name,
         email,
         created_at,
         subscription_plan_id,
         subscription_status,
         trial_start,
         trial_end,
         subscription_start,
         subscription_end,
         payment_status`,
      [
        plan.id,
        now,
        trialEnd,
        subscriptionEnd,
        customerId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.status(200).json({
      message:
        "Premium subscription activated successfully",
      customer: result.rows[0],
      subscriptionPlan: plan
    });

  } catch (error) {
    console.error(
      "Customer subscription error:",
      error
    );

    res.status(500).json({
      message: "Subscription activation failed",
      error: error.message
    });
  }
}


module.exports = {
  customerSignup,
  customerSignin,
  subscribeCustomer
};


