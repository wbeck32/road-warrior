// this is app.js

var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/roadwarrior';
var bodyParser = require('body-parser');

mongoClient.connect(url, function(err, db){
  if (err) throw err;
  app.set('mongo', db); 
})

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.post('/api/saveatrek', function(req, res){
  var db = app.get('mongo');
  var treks = db.collection('treks');
  console.log(req.body.trek);
  treks.insert(req.body.trek, function(err, document){
    if(err) throw err;
    res.json(document.ops[0]._id);
  });
})

app.get('/api/retrieveatrek/:trekid', function(req, res) {
	var db = app.get('mongo');
	var treks = db.collection('treks');
	treks.find({_id: ObjectId(req.params.trekid)}).toArray(function(err, docs) {
		res.json(docs);
	});
})

app.listen(3000);

console.log("listening on port 3000");