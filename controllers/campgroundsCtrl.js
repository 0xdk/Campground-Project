const Campground = require('../models/campgroundSchema');
const AppError = require('../utils/AppError');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// redis
const redis = require('redis');
const client = redis.createClient();
client.connect();

const DEFAULT_EXPIRATION = 500;

// mapbox token
const mbToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbToken });

// cloudinary
const { cloudinary } = require('../cloudinary');

// function to get the data from Redis
const getCacheData = async (key) => {
  console.log(key);
  const cachedData = await client.get(key);
  const camps = JSON.parse(cachedData);
  return camps;
};
//  function to set the data in Redis
const setCacheData = async (key, data) => {
  await client.setEx(key, DEFAULT_EXPIRATION, JSON.stringify(data));
};

module.exports.index = async (req, res) => {
  const key = 'camps';
  const camps = await getCacheData(key);
  if (camps !== null) {
    console.log('cached');
    res.render('campgrounds/campsList', { camps });
  } else {
    console.log('not cached');
    let camps = await Campground.find({});
    setCacheData(key, camps);
    res.render('campgrounds/campsList', { camps });
  }
};

module.exports.renderNewForm = (req, res, next) => {
  res.render('campgrounds/newCamp');
};

module.exports.createCampground = async (req, res, next) => {
  // converting location into geo data using geocoding API - it's off due to limited API request
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  // storing geo data
  const camps = new Campground(req.body.campground);
  console.log(camps);
  camps.geometry = geoData.body.features[0].geometry;
  // storing images
  camps.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camps.owner = req.user._id;
  await camps.save();
  // updating cache
  const camp = await Campground.find({});
  setCacheData('camps', camp);
  req.flash('success', 'campground created');
  res.redirect(`/campgrounds/${camps._id}`);
};

module.exports.showCamp = async (req, res) => {
  const id = req.params.id;
  const camps = await getCacheData(id);
  if (camps !== null) {
    console.log('cached');
    res.render('campgrounds/camp', { camps });
  } else {
    const camps = await Campground.findById(id)
      // populates reviews inside campground
      .populate({
        path: 'reviews',
        // this populate owner from the review
        populate: { path: 'owner' },
      })
      // populates owner inside campground
      .populate('owner');
    console.log('not cached');
    if (!camps) {
      throw new AppError("Can't Find Any Camps :(", 404);
    }
    setCacheData(id, camps);
    res.render('campgrounds/camp', { camps });
  }
};

// edit get
module.exports.renderEditForm = async (req, res) => {
  const id = req.params.id;
  const camps = await getCacheData(id);
  if (camps !== null) {
    console.log('cached');
    res.render('campgrounds/edit', { camps });
  } else {
    let camps = await Campground.findById(id);
    if (!camps) {
      req.flash('error', "can't find any campground");
      return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { camps });
  }
};

// edit put
module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  const camps = await Campground.findByIdAndUpdate(id, req.body.campground, {
    new: true,
  });

  if (!camps.owner.equals(req.user._id)) {
    req.flash('error', 'you are not the owner ');
    return res.redirect(`/campgrounds/${id}`);
  }

  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  camps.images.push(...imgs);

  // updating redis cache
  await camps.save();
  setCacheData(id, camps);

  if (req.body.deleteImages) {
    // removing image form cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // removing image form mongo
    await camps.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash('success', 'Updated Successfully');
  res.redirect(`/campgrounds/${camps._id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  // updating redis cache
  const camps = await Campground.find({});
  setCacheData('camps', camps);
  req.flash('deleted', 'campground deleted');
  res.redirect('/campgrounds');
};

module.exports.deleteMany = async (req, res) => {
  await Campground.deleteMany({});
  res.redirect('/home');
};
