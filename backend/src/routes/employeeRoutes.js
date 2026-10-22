const express = require("express");

const {
  getRoles,
  createEmployee,
  getEmployees,
  deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

// Get all roles
router.get("/roles", getRoles);

// Get all employees
router.get("/", getEmployees);

// Create employee
router.post("/", createEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;