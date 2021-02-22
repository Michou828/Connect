//Express is a node module for building HTTP servers
var express = require('express');
var app = express();

//Tell express to looking in the "public" directory first
app.use(express.static("public"));

//The default route of / and what to do
app.get("/", function(req,res){
    res.send("Thanks for connecting my server! :D");
});

app.listen(80);
