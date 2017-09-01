const express = require('express'),
      router = express.Router(),
      Campground = require('../models/campground'),
      MW = require('../middleware'),
      NodeGeocoder = require('node-geocoder'),
      geocoder = NodeGeocoder({
          provider: 'google',
          httpAdapter: 'https',
          apiKey: 'AIzaSyBR9fKiNtAF4PV0KLBb0QUNMMpukhM59Dw'
      });

// index route
router.get('/campgrounds', (req, res) => {
    Campground.find({}, (err, campgrounds) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        } else {
            res.render("campgrounds/index", {campgrounds: campgrounds, page: "campgrounds"});
        };
    });
});
// new campground form
router.get('/campgrounds/new', MW.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});
// create route
router.post('/campgrounds', MW.isLoggedIn, (req, res) => {
    // get data from submitted form, which is exposed by bodyParser on req.body
    var newCampground = {
        name: req.body.name, 
        image: req.body.image, 
        description: req.body.description,
        price: req.body.price,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    };
    // use geocode api to convert input location to latitude, longitude, and address properties
    geocoder.geocode(req.body.location, (err, data) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        }
        newCampground.lat = data[0].latitude;
        newCampground.lng = data[0].longitude;
        newCampground.location = data[0].formattedAddress;
        // create and save campground into database
        Campground.create(newCampground, (err, returnedCampground) => {
            if (err) {
                req.flash("error", `Something went wrong...${err}`);
                res.redirect("back");
            } else {
                req.flash("success", "Successfully created a campground");
                res.redirect("/campgrounds");
            };
        });
    });
});
// show route
router.get('/campgrounds/:id', (req, res) => {
    // use mongoose to find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec( 
        (err, returnedCampground) => {
            if (err) {
                req.flash("error", `Something went wrong...${err}`);
                res.redirect("/campgrounds");
            } else {
                res.render("campgrounds/show", {campground: returnedCampground});
            }
        }
    );
});
// edit route
router.get('/campgrounds/:id/edit', MW.isCampgroundOwner, (req, res) => {
    Campground.findById(req.params.id, (err , returnedCampground) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        } else {
            res.render('campgrounds/edit', {campground: returnedCampground});
        }
    });
});
// update route
router.put('/campgrounds/:id', MW.isCampgroundOwner, (req, res) => {
    // use geocode api to convert input location to latitude, longitude, and address properties
    geocoder.geocode(req.body.campground.location, (err, data) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        } else {
            newCampground = req.body.campground;
            newCampground.lat = data[0].latitude;
            newCampground.lng = data[0].longitude;
            newCampground.location = data[0].formattedAddress;
            console.log(newCampground);
            Campground.findByIdAndUpdate(req.params.id, newCampground, (err, returnedCampground) => {
                if (err) {
                    req.flash("error", `Something went wrong...${err}`);
                    res.redirect('/campgrounds/'+req.params.id);
                } else {
                    req.flash("success", "Successfully edited campground");
                    res.redirect('/campgrounds/'+req.params.id);
                }
            });
        }
    });
});
// destroy route
router.delete('/campgrounds/:id', MW.isCampgroundOwner, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect('/campgrounds');
        } else {
            req.flash("success", "Successfully deleted campground");
            res.redirect('/campgrounds');            
        }
    });
});

module.exports = router;