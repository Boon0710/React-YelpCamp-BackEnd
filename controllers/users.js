const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return res.status(500).json({ message: "Error logging in after registration." });
            res.status(200).json({ message: 'Registration successful!', user: registeredUser });
        })
    } catch(e){
        res.status(400).json({ message: e.message });
    }
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Authentication Error:", err);  // Log the error details
            return next(err);  // Pass the error to the next middleware (e.g., error handler)
        }
        if (!user) {
            console.log("Login Failed:", info.message);  // Log the failure reason
            return res.status(400).json({ message: "Invalid username or password" });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Login Error:", err);  // Log any login errors
                return next(err);  // Pass the login error to the next middleware
            }
            req.flash('success', 'Welcome back!');
            console.log("Login Successful:", user.username);  // Log the success
            res.status(200).json({ message: 'Login successful!', redirectUrl: '/campgrounds' });
        });
    })(req, res, next);  // Include `next` as the third argument here
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return res.status(500).json({ message: 'Error logging out.' });
        }
        res.status(200).json({ message: 'Logout successful!' });
    });
}