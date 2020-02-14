// npm install express mongoose body-parser ejs method-override express-sanitizer passport passport-local method-override passport-local-mongoose express-session --save
var express = require("express");
var app = express()
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var Campground=  require("./models/campgrounds");
var Comment = require("./models/comment");
var seedDB = require("./seed");
var User = require("./models/user");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");

var commentRoutes		 = require("./routes/campgrounds"),
	campgroundRoutes 	 = require("./routes/comments"),
	indexRoutes           = require("./routes/index")
	


// seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp",{ useNewUrlParser: true, useUnifiedTopology: true });
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));

// Passport Configuration
app.use(require("express-session")({
	secret: "tuffy is get",
	resave : false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next ){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);




app.listen(3000, function(){
	console.log("server listening on port 3000");
});



















