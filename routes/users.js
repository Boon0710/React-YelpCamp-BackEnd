const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const passport = require("passport");
const { storeReturnTo, isLoggedIn, isProfileOwner } = require("../middleware");
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

//controller:
const users = require("../controllers/users");

router.post("/register", catchAsync(users.register));

router.post("/login", storeReturnTo, users.login);

router.post("/logout", users.logout);

// View user profile (public)
router.get('/profile/:userId', users.viewUserProfile);

// Update user profile (restricted to profile owner)
router.put('/profile/:userId', isLoggedIn, isProfileOwner, upload.single('profilePicture'), users.updateUserProfile);

router.get("/check-auth", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});

module.exports = router;

