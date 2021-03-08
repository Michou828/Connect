var https = require('https');
var fs = require('fs'); // Using the filesystem module

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};



// Start Normal Express Code
var express = require('express');
var app = express();
var session = require('express-session');
var nedbstore = require('nedb-session-store')(session);

//User database
var Datastore = require('nedb');
var db = new Datastore({filename: 'users.db', autoload: true});

//npm install bcrypt-nodejs
var bcrypt = require('bcrypt-nodejs');

// https://github.com/kelektiv/node-uuid
// npm install uuid
const uuid = require('uuid');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended:true});
app.use(urlencodedParser);

app.use(express.static('public'));

app.use(
	session(
		{
			secret: 'secret',
			cookie: {
				 maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
				},
			store: new nedbstore({
			 filename: 'sessions.db'
			})
		}
	)
);



//Hash password
function generateHash(password) {
	return bcrypt.hashSync(password);
}

function compareHash(password, hash) {
    return bcrypt.compareSync(password, hash);
}

// app.get('/', function(req, res) {
//   if (!req.session.userid) {
//   	req.session.userid = uuid.v1();
//   }
  
//   res.send('session user-id: ' + req.session.userid + '. ');
// });

// Main page
app.get('/', function(req, res) {
	console.log(req.session.username);

	if (!req.session.username) {
		res.redirect('/login.html'); 
	} else {
		// Give them the main page
  		//res.send('session user-id: ' + req.session.userid + '. ');
		// res.send(req.session);
        var lastlogin = req.session.lastlogin;
        var timeelapsed = Date.now() - lastlogin;
        timeelapsed /= 1000;
        res.send("Your were last here: " + Math.round(timeelapsed) + " seconds ago.");
	}
});



//Register
app.post('/register', function(req, res) {
	// We want to "hash" the password so that it isn't stored in clear text in the database
	var passwordHash = generateHash(req.body.password);

	// The information we want to store
	var registration = {
		"username": req.body.username,
		"password": passwordHash
	};

	// Insert into the database
	db.insert(registration);
	console.log("inserted " + registration);
	
	// Give the user an option of what to do next
	res.send("Registered Sign In" );
	
});	

// Post from login page
app.post('/login', function(req, res) {

	// Check username and password in database
	db.findOne({"username": req.body.username},
		function(err, doc) {
			if (doc != null) {
				
				// Found user, check password				
				if (compareHash(req.body.password, doc.password)) {				
					// Set the session variable
					req.session.username = doc.username;

					// Put some other data in there
					req.session.lastlogin = Date.now();

					res.redirect('/');
					
				} else {

					res.send("Invalid Try again");

				}
			} 
		}
	);
	

});


app.get('/logout', function(req, res) {
	delete req.session.username;
	res.redirect('/');
});	

var httpsServer = https.createServer(credentials, app);

// Default HTTPS Port
httpsServer.listen(443, function(){
    console.log('App listening on port 443!');
});