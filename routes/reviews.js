let express = require('express');
const { model } = require('mongoose');
let router = express.Router({ mergeParams: true });

// controller
const reviewsCtrl = require('../controllers/reviewsCtrl');

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
