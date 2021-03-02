var datastore = require('nedb');
var db = new datastore({ filename: 'database.json', autoload: true });

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/formdata',function(req,res){
    var dataToSave = {
        guestname: req.query.guestname,
        donation: req.query.donation,
        timestamp: Date.now()
    };

    db.insert(dataToSave, function (err, newDoc) {   
        db.find({}).sort({timestamp: -1}).exec(function(err,docs){
            res.send(docs);
        });
      });
});

app.listen(80, function(){
    console.log('App listening on port 80!');
});
