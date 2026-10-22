const express = require("express");

const {
  signup,
  signin,
  getSubscription,
  getOrganizations
} = require("../controllers/authController");;

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/subscription", getSubscription);
router.get("/organizations", getOrganizations);

module.exports = router;