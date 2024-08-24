const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }

    const campgrounds = await Campground.find(query);
    res.status(200).json(campgrounds);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving campgrounds" });
  }
};

module.exports.createCampground = async (req, res, next) => {
  try {
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
      })
      .send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    campground.author = req.user._id;
    await campground.save();

    res
      .status(201)
      .json({ message: "Campground created successfully!", campground });
  } catch (e) {
    res
      .status(400)
      .json({ message: "Error creating campground.", error: e.message });
  }
};

module.exports.showCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!campground) {
      return res.status(404).json({ message: "Campground not found." });
    }
    res.status(200).json(campground);
  } catch (e) {
    res.status(500).json({ message: "Error retrieving campground." });
  }
};

module.exports.updateCampground = async (req, res) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }

    // Instead of redirecting or flashing messages, send a JSON response
    res.json({
      success: true,
      message: "Successfully updated campground",
      campground,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the campground",
      error: error.message,
    });
  }
};

module.exports.deleteCampground = async (req, res) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.status(200).json({ message: "Campground deleted successfully." });
  } catch (e) {
    res.status(500).json({ message: "Error deleting campground." });
  }
};
