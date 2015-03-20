// this is app.js

var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/roadwarrior';
var bodyParser = require('body-parser');

mongoClient.connect(url, function(err, db){
  if (err) throw err;
  app.set('mongo', db); 
})

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({strict: false}));

app.post('/api/saveatrek', function(req, res){
  var db = app.get('mongo');
  var treks = db.collection('treks');
  console.log(req.body.trek);
  treks.insert(req.body.trek, function(err, document){
    if(err) throw err;
    res.json(document);
  });
})

app.listen(3000);

console.log("listening on port 3000");
