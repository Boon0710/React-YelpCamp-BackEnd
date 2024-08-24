const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

//controller:
const users = require("../controllers/users");

router.post("/register", catchAsync(users.register));

router.post("/login", storeReturnTo, users.login);

router.post("/logout", users.logout);

router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;
