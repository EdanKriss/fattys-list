const express = require('express'),
      router = express.Router(),
      Campground = require('../models/campground'),
      Comment = require('../models/comment'),
      MW = require('../middleware');

// new comment form
router.get('/campgrounds/:id/comments/new', MW.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});
// create route
router.post('/campgrounds/:id/comments', MW.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect('/campgrounds');
        } else {
            Comment.create(req.body.comment, (err, returnedComment) => {
                if (err) {
                    req.flash("error", `Something went wrong...${err}`);
                    console.log(err);
                } else {
                    // add username and id to comment, save comment                  
                    returnedComment.author.id = req.user._id;
                    returnedComment.author.username = req.user.username;
                    returnedComment.save();
                    // associate comment to campground, save campground
                    campground.comments.push(returnedComment);
                    campground.save();
                    req.flash("success", "Successfully created comment");
                    res.redirect(`/campgrounds/${campground._id}`);
                }
            });
        }
    });
});
// edit route
router.get('/campgrounds/:id/comments/:comment_id/edit', MW.isCommentOwner, (req, res) => {
    Comment.findById(req.params.comment_id, (err, comment) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect("back");
        } else {
            res.render("comments/edit", {comment: comment, campground_id: req.params.id});
        }
    });
});
// update route
router.put('/campgrounds/:id/comments/:comment_id', MW.isCommentOwner, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, returnedComment) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);
            res.redirect('back');
        } else {
            req.flash("success", "Successfully edited comment");            
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});
// destroy route
router.delete('/campgrounds/:id/comments/:comment_id', MW.isCommentOwner, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            req.flash("error", `Something went wrong...${err}`);            
            res.redirect('back');
        } else {
            req.flash("success", "Successfully deleted comment");            
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

module.exports = router;