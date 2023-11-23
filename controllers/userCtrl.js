const User = require('../models/userSchema');

module.exports.renderSignup = (req, res, next) => {
  res.render('users/signup');
};

module.exports.signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const regUser = await User.register(user, password);
    req.logIn(regUser, (err) => {
      if (err) return next(err);
      req.flash('success', 'Sign Up successful');
      res.redirect('/campgrounds');
    });
  } catch (err) {
    req.flash('error', err.message);
    res.redirect('/signup');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res) => {
  req.flash('success', 'logged in successfully');
  console.log(res.locals.returnTo);
  const redirectUrl = res.locals.returnTo || '/campgrounds';
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, err) => {
  req.logOut((err) => {
    if (err) return next(err);

    req.flash('success', 'successfully logged out');
    res.redirect('/login');
  });
};
