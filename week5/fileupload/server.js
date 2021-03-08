var https = require('https');
var fs = require('fs'); // Using the filesystem module

var credentials = {
  key: fs.readFileSync('star_itp_io.key'),
  cert: fs.readFileSync('star_itp_io.pem')
};


var datastore = require('nedb');
var db = new datastore({ filename: 'database.json', autoload: true });

var express = require('express');
var multer  = require('multer');
var bodyParser = require('body-parser');
var app = express();

var urlencodedBodyParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedBodyParser);

var upload = multer({ dest: 'public/uploads/' })

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/displayrecord',function(req,res){
    db.find({_id: req.query._id}, function(err, docs){
        var dataWrapper = {data: docs[0]};
        res.render("indivisual.ejs", dataWrapper);
    });
});

app.post('/formdata',upload.single('photo'),function(req,res){
    // console.log(req.file);


    var dataToSave = {
        file: req.file,
        name: req.body.name,
        gender: req.body.gender,
        color: req.body.color,
        main_course: req.body.main_course,
        sides: req.body.sides,
        allergy: req.body.allergy,
        timestamp: Date.now()
    };

    db.insert(dataToSave, function (err, newDoc) {   
        db.find({}).sort({timestamp: -1}).exec(function(err,docs){
            var dataWrapper = {data: docs};
            res.render("outputtemplet.ejs", dataWrapper);
        });
      });
});

var httpsServer = https.createServer(credentials, app);

// Default HTTPS Port
// httpsServer.listen(443);
httpsServer.listen(443, function(){
    console.log('App listening on port 443!');
});
