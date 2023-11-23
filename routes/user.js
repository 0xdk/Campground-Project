let express = require('express');
let router = express.Router();
// controller
let userCtrl = require('../controllers/userCtrl');
let User = require('../models/userSchema');
let passport = require('passport');
let { storeReturnTo } = require('../middleware/middleware');

router.route('/signup').get(userCtrl.renderSignup).post(userCtrl.signup);

router
  .route('/login')
  .get(userCtrl.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
    }),
    userCtrl.login
  );

router.get('/logout', userCtrl.logout);

module.exports = router;
