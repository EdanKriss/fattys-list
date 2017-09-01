const Campground = require('../models/campground'), 
      Comment = require('../models/comment');

const middlewareObj = {
    isLoggedIn: (req, res, next) => {
        // is user logged in
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("error", "Please Login First");
        res.redirect('/login');
    },
    
    isCampgroundOwner: (req, res, next) => {
        // is user logged in
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, (err , returnedCampground) => {
                if (err) {
                    req.flash("error", `Campground not found...${err}`);
                    res.redirect("back");
                } else {
                    // does user own campground entry
                    if (returnedCampground.author.id.equals(req.user._id)) {
                        next();             
                    } else {
                        req.flash("error", "You lack permission to do that");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash("error", "Please login first");
            res.redirect('back');
        }
    },

    isCommentOwner: (req, res, next) => {
        // is user logged in
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, (err , returnedComment) => {
                if (err) {
                    req.flash("error", `Comment not found...${err}`);
                    res.redirect("back");
                } else {
                    // does user own comment
                    if (returnedComment.author.id.equals(req.user._id)) {
                        next();             
                    } else {
                        req.flash("error", "You lack permission to do that");
                        res.redirect('back');
                    }
                }
            });
        } else {
            req.flash("error", "Please login first");
            res.redirect('back');
        }
    }
};

module.exports = middlewareObj;