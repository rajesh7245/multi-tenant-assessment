const express = require("express");

const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getCustomerOrders
} = require("../controllers/orderController");

const router = express.Router();

// Customer places an order
router.post("/", createOrder);

// Organization staff views orders
router.get("/", getOrders);

// Customer tracks their own orders
router.get("/customer", getCustomerOrders);

// View one order
router.get("/:id", getOrder);

// Organization staff updates order status
router.put("/:id/status", updateOrderStatus);

module.exports = router;