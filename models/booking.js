const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numGuests: {
    type: Number,
    required: true,
    min: 1
  },
  numNights: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  campground: {
    type: Schema.Types.ObjectId,
    ref: 'Campground',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
