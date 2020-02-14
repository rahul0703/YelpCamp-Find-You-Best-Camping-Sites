var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

// ==========================================================================================
// COMMENT ROUTE
// ===========================================================================================
router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
// 	find the id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new", {campground: campground});
		}
	});
});

router.post("/campgrounds/:id/comments",isLoggedIn, function(req, res){
// 	look campground using id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			req.flash("error", "Something went wrong! contact administrator");
			res.redirect("/campgrounds")
		}else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Can't create comment!");
					console.log("there is an error");
				}else{
// 					Add username and id to the comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
// 					Save the comment
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Created a new comment!");
					res.redirect("/campgrounds/"+ campground._id);
				}
			});
		}
	});
});

// edit comment route
router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundComment){
			req.flash("error", "comment not found!");
			res.redirect("back");
		}else{
			Comment.findById(req.params.comment_id, function(err, foundComment){
				if(err){
					res.redirect("back");
				}else{
					res.render("comments/edit", {campground_id : req.params.id , comment: foundComment});
				}
			});
		}
	});
});

// Comment update route
router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}else{
			req.flash("success", "You successfully updated the comment!");
			res.redirect("/campgrounds/"+ req.params.id);
		}	
	});
});

// Comment Destriy Route
router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash("error", "Comment not found!");
			res.redirect("back");
		}else{
			req.flash("success", "You successfully deleted the comment!");
			res.redirect("/campgrounds/"+ req.params.id);
		}
	});
});

// Adding middle ware
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Please LogIn First!");
	res.redirect("/login");
}

// Adding a middleware for comment ownership
function checkCommentOwnership(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				console.log(err || !foundComment);
				req.flash("error", "Comment Not Found!");
				res.redirect("back");
			}else{
				// is the user same as who created the campground
				if(foundComment.author.id.equals(req.user._id)){
					next();
				}else{
					re.flash("error", "You are not authorized to do that!");
					// if not, then redirect somewhere 	
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please Login First!");
// 	if not redirect login page
		res.render("login");
	}
}

module.exports = router;
