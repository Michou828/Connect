var https = require('https');
var fs = require('fs'); // Using the filesystem module

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};


var datastore = require('nedb');

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app = express();


var urlencodedBodyParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedBodyParser);

// app.use(express.static('public'));
app.use("/public", express.static(__dirname + "/public"));
app.use("/css", express.static(__dirname + "/css"));
app.set('view engine', 'ejs');

app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				    maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				}
		}
	)
);

// ----- Util -------//

var bcrypt = require('bcrypt-nodejs');
//Hash password
function generateHash(password) {
	return bcrypt.hashSync(password);
}
function compareHash(password, hash) {
    return bcrypt.compareSync(password, hash);
}


// ------ User Acount -------//

// account database:
var user_db = new datastore({filename: 'users.json', autoload: true});

app.get('/user_login', function(req,res){
    var message = { errorMessage: false };
    res.render('login.ejs', message);
});
app.get('/user_register', function(req,res){
    var message = { errorMessage: false };
    res.render('register.ejs', message);
});

//Register
app.post('/register', function(req, res) {
    // see if duplicated username
    user_db.findOne({username: req.body.username}, function(err, doc){
        if(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
        if(!doc){
            // We want to "hash" the password so that it isn't stored in clear text in the database
            var passwordHash = generateHash(req.body.password);
            // The information we want to store
            var registration = {
                "username": req.body.username,
                "password": passwordHash
            };
            // Insert into the database
            user_db.insert(registration);
            console.log("inserted ===>", registration);
            // Give the user an option of what to do next
            res.redirect('/storyhub');
            return;
        }
        var message = { errorMessage: "User @" + req.body.username + " exists. Please pick another one" };
        res.render('register.ejs', message);
        // console.log('User ' + req.body.username + ' exist');
        // res.status(500).send('User ' + req.body.username + ' exist');
        return;
    });
});



// Post from login page
app.post('/login', function(req, res) {
	// Check username and password in database
	user_db.findOne({"username": req.body.username},
		function(err, doc) {
			if (doc != null) {
				// Found user, check password				
				if (compareHash(req.body.password, doc.password)) {				
					// Set the session variable
					req.session.username = doc.username;
					// Put some other data in there
					req.session.lastlogin = Date.now();
					res.redirect('/storyhub');
				} else {
                    var message = { errorMessage: "Invalid passcode, please try again." };
                    res.render('login.ejs', message);
				}
			} else {
                var message = { errorMessage: "User doesn't exit, please try again." };
                res.render('login.ejs', message);
            }
		}
	);
});




//Log out
app.get('/logout', function(req, res) {
	delete req.session.username;
	res.redirect('/');
});	

// ------ user post -------//

// post database:
var post_db = new datastore({ filename: 'database.json', autoload: true });

// post a new public/private post
app.post('/newstory',function(req,res){
    if(
        !req.session.username ||
        req.session.username===''
    ){
        res.redirect('/user_login');
        return;
    };

    var dataToSave = {
        story: req.body.story,
        storyColor: req.body.storyColor,
        visibility: req.body.visibility,
        timestamp: Date.now(),
        username: req.session.username
    };

    post_db.insert(dataToSave, function (err, newDoc) {   
        post_db.find({username: req.session.username}).sort({timestamp: -1}).exec(function(err,docs){
            var dataWrapper = {data: docs};
            res.redirect('/storyhub');
        });
    });
});

// request all public posts in the database
app.get('/',function (req,res){
    post_db.find({visibility : 'publicView'}).sort({timestamp: -1}).exec(function(err,docs){
        if(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
        var dataWrapper = {data: docs, user: req.session.username};

        // console.log('Public Data ====>', dataWrapper);
        res.render("welcome.ejs", dataWrapper);
    });
});

// request all post of the user
app.get('/storyhub',function (req,res){
    if(
        !req.session.username ||
        req.session.username===''
    ){
        res.redirect('/user_login');
        return;
    };

    post_db.find({username: req.session.username}).sort({timestamp: -1}).exec(function(err,docs){
        if(err){
            console.log(err);
            res.sendStatus(500);
            return;
        }
        var dataWrapper = {data: docs, user: req.session.username};
        // console.log(dataWrapper);
        res.render("storyhubtemplet.ejs", dataWrapper);
    });
});



var httpsServer = https.createServer(credentials, app);

// Default HTTPS Port
httpsServer.listen(443, function(){
    console.log('App listening on port 443!');
});
