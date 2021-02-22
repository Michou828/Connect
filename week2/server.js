var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var urlencodedBodyParser = bodyParser.urlencoded({extended:true});
app.use(urlencodedBodyParser);

app.use(express.static('public'));

var submitedData =[];

app.post('/formdata',function(req,res){
    //Second way of creating data obejcet
    var dataToSave = {
        name: req.body.name,
        gender: req.body.gender,
        color: req.body.color,
        main_course: req.body.main_course,
        sides: req.body.sides
    };

    //Adding data objects to Data array
    submitedData.push(dataToSave);
    //console.log(submitedData);

    //Displaying saved data
    var output ="<html><body style=\"margin: 20%; font-family: sans-serif; background-color: aquamarine;\">";

    var lastPersonIndex = submitedData.length-1;
    if (submitedData[lastPersonIndex].gender == "male"){
        output += "<h1> Hello! Handsome " + submitedData[lastPersonIndex].name + "</h1>";
    }else{
        output += "<h1> Hello! Beautiful " + submitedData[lastPersonIndex].name + "</h1>";
    }

    output += "<p>The guest list for tonight:</p><br />"

    for (let i = 0; i < submitedData.length; i++){
        output += "<p style=\"color: "+ submitedData[i].color + ";\">" + submitedData[i].name + "<br /></p>";
    }

    output += "<p>However we are very sorry to inform you that we ran out of "+ submitedData[lastPersonIndex].main_course + " with " + submitedData[lastPersonIndex].sides + "</p><br />";
    
    // output +="<script>function anotherForm(){ app.use(express.static('public')); }</script>"
    // output +="<button type=\"button\" id=\"anotherOrder\" onclick=\"anotherForm()\">Place another order for someone else</button>"

    output += "</body></html>";
    res.send(output);    
})

app.listen(80, function(){
    console.log('App listening on port 80!');
})
