const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      User = require('../models/user');

// landing page
router.get('/', (req, res) => {
    res.render("landing");
});
// sign up form
router.get('/register', (req, res) => {
    res.render('register', {page: "register"});
});
// handle sign up
router.post('/register', (req, res) => {
    User.register(new User({username: req.body.username}), req.body.password, (err, user) => {
        if (err) {
            req.flash("error", `Unable to register user...${err}`);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, () => {
                req.flash("success", `Welcome to Fatty's List, ${user.username}!`);
                res.redirect('/campgrounds');
            });
        }
    });
});
// login form
router.get('/login', (req, res) => {
    res.render('login', {page: "login"});
});
// handle login
router.post('/login', passport.authenticate('local', 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        failureFlash: true
    }), (req, res) => {
});
// handle logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Logged you out!");
    res.redirect('/campgrounds');
});

module.exports = router;