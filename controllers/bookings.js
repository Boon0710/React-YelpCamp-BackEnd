const Booking = require("../models/booking");
const Campground = require("../models/campground");

module.exports.createBooking = async (req, res) => {
  try {
    const { startDate, endDate, numGuests, numNights } = {
      ...req.body,
      numGuests: Number(req.body.numGuests),
    };
    const campgroundId = req.params.id; 
    const user = req.user._id;
    
    if (!campgroundId) {
      return res.status(400).json({ message: "Campground ID is required." });
    }
    const campground = await Campground.findById(campgroundId);
    if (!campground) {
      return res.status(404).json({ message: "Campground not found." });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid start or end date." });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date." });
    }

    // Find conflicting bookings
    const conflictingBookings = await Booking.find({
      campground: campgroundId,
      $or: [
        { startDate: { $lte: end, $gte: start } }, // Booking starts within the selected range
        { endDate: { $lte: end, $gte: start } }, // Booking ends within the selected range
        { startDate: { $lte: start }, endDate: { $gte: end } }, // Booking completely overlaps the selected range
      ],
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        message: "Selected dates are unavailable due to existing bookings.",
      });
    }

    // Proceed to create the booking if no conflicts
    const newBooking = new Booking({
      startDate: start,
      endDate: end,
      numGuests,
      numNights,
      isPaid: false,
      campground: campgroundId,
      user,
    });

    console.log(req.body);
    await newBooking.save();
    res
      .status(201)
      .json({ message: "Booking created successfully!", booking: newBooking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};

module.exports.fetchAllBookingsForACampground = async (req, res) => {
  try {
    const campgroundId = req.params.id;

    // Find bookings where the campground matches the campgroundId
    const bookings = await Booking.find({ campground: campgroundId }).populate(
      "user"
    );

    if (!bookings) {
      return res
        .status(404)
        .json({ message: "No bookings found for this campground." });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching bookings for this campground.",
      error: error.message,
    });
  }
};

module.exports.fetchBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find the booking by its ID
    const booking = await Booking.findById(bookingId).populate('user').populate('campground');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching booking details.",
      error: error.message,
    });
  }
};

module.exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error canceling booking", error: error.message });
  }
};

module.exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { startDate, endDate, numGuests, numNights } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { startDate, endDate, numGuests, numNights },
      { new: true, runValidators: true }  // new: true returns the updated booking
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking updated successfully", booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error: error.message });
  }
}