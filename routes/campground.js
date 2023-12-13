let express = require('express');
let router = express.Router();
// controller
let campgrounds = require('../controllers/campgroundsCtrl');
// utils
let wrapAsync = require('../utils/wrapAsync');
// cloudinary
const { storage } = require('../cloudinary');
// multer
const multer = require('multer');
// middleware to upload images to cloudinary
const upload = multer({ storage });

// middleware
let { isLoggedIn, campValidate, isOwner } = require('../middleware/middleware');

router
  .route('/')
  .get(campgrounds.index)
  .post(
    isLoggedIn,
    upload.array('image'),
    campValidate,
    wrapAsync(campgrounds.createCampground)
  )
  .delete(isLoggedIn, wrapAsync(campgrounds.deleteMany));

// Create
router.get('/newCamp', isLoggedIn, campgrounds.renderNewForm);

// camp search
router.post('/search', campgrounds.campSearch);

router
  .route('/:id')
  .put(
    isLoggedIn,
    isOwner,
    upload.array('image'),
    campValidate,
    wrapAsync(campgrounds.updateCamp)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(campgrounds.deleteCamp));

// read
router.get('/:id', wrapAsync(campgrounds.showCamp));

// Update
router.get(
  '/:id/edit',
  isLoggedIn,
  isOwner,
  wrapAsync(campgrounds.renderEditForm)
);

module.exports = router;
