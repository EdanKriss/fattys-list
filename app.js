const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose'),
      flash = require('connect-flash'),
      passport = require('passport'),
      LocalStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      Campground = require('./models/campground'),
      Comment = require('./models/comment'),
      User = require('./models/user'),
      port = process.env.PORT || 3000,
      dbURI = process.env.FAT_MONGO_URI || 'mongodb://localhost/fattys_list';
const campgroundRoutes = require('./routes/campgrounds'),
      commentRoutes    = require('./routes/comments'),
      otherRoutes      = require('./routes/others');

// replace deprecated mongoose promise library with global promise library
mongoose.Promise = global.Promise;
// connect to database, no need to then call open or openURI due to passing useMongoClient
mongoose.connect(dbURI, {useMongoClient: true})
    .then(() => console.log("Connected to mongoDB"))
    .catch(err => console.log(`Database connection error: ${err.message}`));
// parses urlencoded http request body (such as POST forms) and exposes on req.body, like $_POST in PHP
app.use(bodyParser.urlencoded({extended: true}));
// ejs templates
app.set('view engine', 'ejs');
// add public asset directory
app.use(express.static(__dirname + "/public"));
// method override to allow put and delete requests from html forms
app.use(methodOverride('_method'));
// flash hash
app.use(flash());
//local variables are accessed from templates, app.locals persists for lifetime of app
app.locals.moment = require('moment');

// passport config
app.use(require('express-session')({
    secret: "SECRET STRING",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// allows current user to be accessed inside templates by adding app middleware used for every request
app.use( function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(otherRoutes);

app.listen(port, () => {
    console.log(`fatty-crafts is now listening on PORT: ${port}`);
});