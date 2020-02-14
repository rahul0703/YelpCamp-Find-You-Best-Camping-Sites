var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comment");

// INDEX...................
router.get("/campgrounds", function(req, res){
// 	get all the files from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(error);
		}else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
});

// POST...............
router.post("/campgrounds",isLoggedIn, function(req, res){
// 	get data from form and add to the camp ground array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {
		name: name, 
		price: price,
		image: image, 
		description: desc,
		author: author
	};
	// create a  new campground and save to DB
	Campground.create(newCampground, function(err, newCreated){
		if(err){
			req.flash("error", "Can't create a new campground!");
			console.log("something went wrong!!!");
			console.log("err");
		}else{
			console.log(newCreated);
			// 	return to the campgrounds
			req.flash("success", "You created a new campground!");
			res.redirect("/campgrounds");
		}
	});
	
});

// NEW...................
router.get("/campgrounds/new", isLoggedIn, function(req, res){
	res.render("campgrounds/new.ejs");
});

// SHOW PAGE
router.get("/campgrounds/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "campground not found!");
			res.redirect("/campgrounds");
		}else{
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// Edit Route
router.get("/campgrounds/:id/edit",checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error", "campground not found!");
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// Update Route
router.put("/campgrounds/:id",checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updateCampground){
		if(err){
			res.redirect("/campgrounds")
		}else{
			req.flash("success", "You successfully updated that campground!");
			res.redirect("/campgrounds/"+ req.params.id);
		}
	});
});

// Destroy Route
router.delete("/campgrounds/:id",checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err, deletedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			deletedCampground.comments.forEach(function(comment){
                Comment.findByIdAndRemove(comment, function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
			req.flash("success", "you successfully deleted that campground!");
            res.redirect("/campgrounds");
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

function checkCampgroundOwnership(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
			if(err){
				console.log(err || !foundCampground);
				req.flash("error", "Campground Not Found!");
				res.redirect("back");
			}else{
				// is the user same as who created the campground
				if(foundCampground.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error", "You are not authorized to do that!");
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


