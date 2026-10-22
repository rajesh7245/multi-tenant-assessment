const express = require("express");

const {
  customerSignup,
  customerSignin
} = require("../controllers/customerController");

const router = express.Router();

router.post("/signup", customerSignup);
router.post("/signin", customerSignin);

module.exports = router;