const express = require("express");

const {
  customerSignup,
  customerSignin,
  subscribeCustomer
} = require("../controllers/customerController");

const router = express.Router();

router.post("/signup", customerSignup);
router.post("/signin", customerSignin);
router.post("/subscribe", subscribeCustomer);

module.exports = router;