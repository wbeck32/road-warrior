// this is app.js

var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/roadwarrior';
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var moment = require('moment');
var jwtKey = process.env.JWTKEY;
   
mongoClient.connect(url, function(err, db){
  if (err) throw err;
  app.set('mongo', db); 
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.post('/api/saveatrek', function(req, res){
  var trek = req.body.trek;
  var db = app.get('mongo');
  var treks = db.collection('treks');
  treks.update({_id: ObjectId(trek.id)}, trek, {upsert: true}, function(err, updateRes){
    if(updateRes.result.upserted){
      res.end(updateRes.result.upserted[0]._id.toString());
    } else {
      res.end();
    }
  });
});

app.delete('/api/deleteatrek/:trekid', function(req, res){
  var db = app.get('mongo');
  var treks = db.collection('treks');
  treks.remove({_id: ObjectId(req.params.trekid)}, {justOne : true}, function(status) {
    console.log('status: ', status);
  });
});

app.get('/api/retrieveatrek/:trekid', function(req, res) {
	var db = app.get('mongo');
	var treks = db.collection('treks');
	treks.find({_id: ObjectId(req.params.trekid)}).toArray(function(err, docs) {
		res.json(docs);
	});
});

app.get('/api/retrievealltreks/:userid', function(req, res) {
  var db = app.get('mongo');
  var treks = db.collection('treks');
  treks.find({userid: req.params.userid}).toArray(function(err, docs) {
    console.log(docs);
    res.json(docs);
  });
});

app.post('/api/usercheck', function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  users.find({username: req.body.username}).toArray(function(err, docs) {
    res.json(docs.length);
  });
});

app.post('/api/signup', function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  users.find({username: req.body.username}).toArray(function(err, docs) {
    if (docs.length === 0) {
      users.insert({username: req.body.username, password: req.body.password}, function(err, docs){
        if (err) throw err;
        res.json({
          token : authenticate(req.body.username),
          user: {username: docs.ops[0].username, _id: docs.ops[0]._id }
        });
      });
    } else {
      res.end('User already exists');
    }
  });
});

app.post('/api/login', function(req, res){
  var db = app.get('mongo');
  var users = db.collection('users');
  users.find({username: req.body.username, password: req.body.password}, {password: 0}).toArray(function(err, docs){
    if (err) throw err;
    if (docs.length === 1) {
      res.json({
        token : authenticate(req.body.username),
        user: docs[0]
      });
    } else {
      res.end('no such user');
    }
  });
});

function authenticate (username){
  var expires = moment().add(7, 'days').valueOf();
  var token = jwt.encode({
    iss: username,
    exp: expires
  }, jwtKey);
  return token;
}

app.listen(3000);

console.log("listening on port 3000");
