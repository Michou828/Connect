var datastore = require('nedb');
var db = new datastore({ filename: 'database.json', autoload: true });

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var urlencodedBodyParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedBodyParser);

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/displayrecord',function(req,res){
    db.find({_id: req.query._id}, function(err, docs){
        var dataWrapper = {data: docs[0]};
        res.render("indivisual.ejs", dataWrapper);
    });
});

app.post('/formdata',function(req,res){
    var dataToSave = {
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

app.listen(80, function(){
    console.log('App listening on port 80!');
});
