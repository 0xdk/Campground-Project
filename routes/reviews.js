let express = require('express');
const { model } = require('mongoose');
let router = express.Router({ mergeParams: true });

// controller
const reviewsCtrl = require('../controllers/reviewsCtrl');

// utils
let wrapAsync = require('../utils/wrapAsync');

// models
const Review = require('../models/reviewSchema');
const Campground = require('../models/campgroundSchema');

// isAuthenticate() and joi validation middleware
let {
  isLoggedIn,
  reviewValidate,
  isOwner,
  isReviewOwner,
} = require('../middleware/middleware');

// review post
router.post('/', isLoggedIn, reviewValidate, reviewsCtrl.createReview);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewOwner,
  reviewsCtrl.deleteReview
);

module.exports = router;
