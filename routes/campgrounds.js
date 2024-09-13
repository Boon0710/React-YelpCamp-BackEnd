const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');


const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({storage});

//controller:
const campgrounds = require('../controllers/campgrounds');

router.get('/',catchAsync(campgrounds.index))

router.post('/', isLoggedIn , upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/:id', catchAsync(campgrounds.showCampground))

router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;