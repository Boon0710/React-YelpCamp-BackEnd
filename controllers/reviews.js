const Review = require("../models/review");
const Campground = require("../models/campground");
const mongoose = require('mongoose');

module.exports.createReview = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(404).json({ message: "Campground not found." });
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.status(201).json({ message: "Review created successfully!", review });
  } catch (e) {
    res
      .status(400)
      .json({ message: "Error creating review.", error: e.message });
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(reviewId)) {
      return res.status(400).json({ message: "Invalid ObjectId format." });
    }

    // Remove the review reference from the campground's reviews array
    const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    if (!campground) {
      return res.status(404).json({ message: "Campground not found." });
    }

    // Delete the actual review document from the database
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: "Review deleted successfully." });
  } catch (e) {
    res.status(500).json({ message: "Error deleting review.", error: e.message });
  }
};
