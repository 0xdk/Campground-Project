// if (process.env.NODE_ENV !== 'production') {
require('dotenv').config();
// }

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
// mongo sanitize is not used in this code, check notion for more info
// let mongoSanitize = require('mongo-sanitize');
const helmet = require('helmet');

// helmet CSP
const { scriptSrcUrls } = require('./utils/helmetCsp');
const { styleSrcUrls } = require('./utils/helmetCsp');
const { connectSrcUrls } = require('./utils/helmetCsp');
const { fontSrcUrls } = require('./utils/helmetCsp');

// models
const User = require('./models/userSchema');

// database connections
// mongo atlas is for production, using local DB for development
// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://localhost:27017/yelp-camp';

main().catch((err) => console.log(err));
async function main() {
  // mongoose.connect(dbUrl);
  await mongoose.connect(dbUrl);
  console.log('mongoose connection open');
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database connection');
});

// template engine
app.engine('ejs', engine);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// app.use(mongoSanitize());

//  requiring Routers
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');

// storing session in mongo using mongo connect
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: 'squirrel',
  },
});

// session
const sessionConfig = {
  store,
  name: 'campers',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure is only work on HTTPs,
    // secure : true,
    expires: Date.now() + 1000 * 24 * 60 * 60 * 7,
    maxAge: 1000 * 24 * 60 * 60 * 7,
  },
};

// using session, flash, and helmet
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

// using helmet and helmet-CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dr29uswhb/',
        'https://images.unsplash.com/',
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// auth
app.use(passport.initialize());
app.use(passport.session());
// using local strategy for user model using passport
passport.use(new localStrategy(User.authenticate()));
// serializeUser help to store data in the session
passport.serializeUser(User.serializeUser());
// deserializeUser help to remove data form the session
passport.deserializeUser(User.deserializeUser());

// middleware
app.use((req, res, next) => {
  // storing user obj in global variable to use it in all templates
  res.locals.user = req.user;
  res.locals.success = req.flash('success');
  res.locals.deleted = req.flash('deleted');
  res.locals.error = req.flash('error');
  next();
});

// using routers
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/review', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('campgrounds/home');
});

// app.all('*', (req, res, next) => {
//   next(new AppError('Page Not Found', 404));
// });

app.use((err, req, res, next) => {
  const { message, status } = err;
  console.log(message);
  // res.send(`${message} - ${status}`);
  res.render('partials/error', { err });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log('listening on port 8080');
});
