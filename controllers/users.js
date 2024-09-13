const User = require("../models/user");
const Review = require("../models/review");
const Campground = require("../models/campground");
const Booking = require("../models/booking");
const passport = require("passport");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    // Set default values if the user doesn't provide them
    const newUser = new User({
        email,
        username,
        fullName: req.body.fullName || "",  // Set default value if not provided
        bio: req.body.bio || "",
        location: req.body.location || "",
        gender: req.body.gender || "Other",
        phoneNumber: req.body.phoneNumber || "",
        profilePicture: {
            url: 'https://res.cloudinary.com/dzqxn0oxf/image/upload/v1724667813/defaultProfilePicture_obhclq.jpg',
            filename: 'defaultProfilePicture_obhclq.jpg'
        }
    });
    
    const registeredUser = await User.register(newUser, password);

    // Log the user in after successful registration
    req.login(registeredUser, (err) => {
        if (err) return res.status(500).json({ message: "Error logging in after registration." });
        res.status(200).json({ message: 'Registration successful!', user: registeredUser });
    });
} catch (e) {
    res.status(400).json({ message: e.message });
}
};

module.exports.login = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Authentication Error:", err); // Log the error details
      return next(err); // Pass the error to the next middleware (e.g., error handler)
    }
    if (!user) {
      console.log("Login Failed:", info.message); // Log the failure reason
      return res.status(400).json({ message: "Invalid username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login Error:", err); // Log any login errors
        return next(err); // Pass the login error to the next middleware
      }
      req.flash("success", "Welcome back!");
      console.log("Login Successful:", user.username); // Log the success
      res
        .status(200)
        .json({ message: "Login successful!", redirectUrl: "/campgrounds" });
    });
  })(req, res, next); // Include `next` as the third argument here
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.status(200).json({ message: "Logout successful!" });
  });
};

module.exports.viewUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const campgrounds = await Campground.find({ author: req.params.userId });
        const reviews = await Review.find({ author: req.params.userId });
        const bookings = await Booking.find({ user: req.params.userId }).populate('campground');

        res.status(200).json({ user, campgrounds, reviews, bookings });
    } catch (e) {
        res.status(500).json({ message: 'Error fetching user profile', error: e.message });
    }
};


module.exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { bio, location, fullName, gender, phoneNumber } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bio = bio;
    user.location = location;
    user.fullName = fullName;
    user.gender = gender;
    user.phoneNumber = phoneNumber;

    
    if (req.file) {
      const { path, filename } = req.file;
      user.profilePicture = { url: path, filename };
    }

    
    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "An error occurred while updating the profile", error });
  }
};
