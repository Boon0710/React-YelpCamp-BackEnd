const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have the permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    }
        next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);
    
        if (!review) {
          return res.status(404).json({ message: "Review not found." });
        }
    
        if (!review.author.equals(req.user._id)) {
          return res.status(403).json({ message: "You do not have permission to delete this review." });
        }
    
        next();
      } catch (e) {
        console.error("Error in isReviewAuthor middleware:", e);
        return res.status(500).json({ message: "Internal server error.", error: e.message });
      }
}

module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}