const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn} = require('../middleware');
const bookings = require("../controllers/bookings");

router.post('/', isLoggedIn, catchAsync(bookings.createBooking))

router.get('/', catchAsync(bookings.fetchAllBookingsForACampground));

router.get('/:bookingId', catchAsync(bookings.fetchBookingById));

router.delete('/:bookingId', catchAsync(bookings.cancelBooking));

router.put('/:bookingId', isLoggedIn, catchAsync(bookings.updateBooking));
module.exports = router;