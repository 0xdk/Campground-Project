// models
const Review = require('../models/reviewSchema');
const Campground = require('../models/campgroundSchema');

// redis
const redis = require('redis');
const client = redis.createClient();
client.connect();

const DEFAULT_EXPIRATION = 500;

// Function to populate reviews and owner
const populateCampground = async (campgroundId) => {
  return Campground.findById(campgroundId)
    .populate({ path: 'reviews', populate: { path: 'owner' } })
    .populate('owner');
};

// Function to set the data in Redis
const setCacheData = async (key, data) => {
  await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(data));
};

module.exports.createReview = async (req, res, next) => {
  try {
    const camp = await populateCampground(req.params.id);
    const review = new Review(req.body.review);

    const key = camp.id;
    // updating the owner to current user
    review.owner = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    setCacheData(key, camp);
    req.flash('reviewed', 'Thanks for your review :)');
    res.redirect(`/campgrounds/${camp._id}`);
  } catch (e) {
    console.log(e);
    next(e);
  }
};

module.exports.deleteReview = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    // The $pull operator removes from an existing array all instances of a value or values that match a specified condition
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await Review.findByIdAndDelete(reviewId);
    const updatedCamp = await populateCampground(id);
    setCacheData(id, updatedCamp);
    res.redirect(`/campgrounds/${id}`);
  } catch (e) {
    console.log('error');
    console.log(e);
    next(e);
  }
};
