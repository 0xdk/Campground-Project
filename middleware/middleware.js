// JOI schema
const { reviewSchema, campSchema } = require('../utils/joiSchema');
let AppError = require('../utils/AppError');
// model
const Campground = require('../models/campgroundSchema');
const Review = require('../models/reviewSchema');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // storing the url to session
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in Bitch');
    return res.redirect('/login');
  }
  next();
};
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    // storing the url from session to local variable
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// joi schema middleware
module.exports.campValidate = (req, res, next) => {
  let { error } = campSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(', ');
    throw new AppError(msg, 400);
  } else {
    next();
  }
};
module.exports.reviewValidate = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(', ');
    throw new AppError(msg, 400);
  } else {
    next();
  }
};

// owner authorization middleware
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let camps = await Campground.findById(id);
  if (!camps.owner.equals(req.user._id)) {
    req.flash('error', 'not an owner');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
module.exports.isReviewOwner = async (req, res, next) => {
  let { reviewId } = req.params;
  let review = await Review.findById(reviewId);

  next();
};
