// this is app.js

var express = require('express');
var app = express();
var mongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/roadwarrior';
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
var moment = require('moment');
var bcrypt = require('bcrypt');
var https = require('https');

var jwtKey = process.env.JWTKEY;

mongoClient.connect(url, function(err, db){
  if (err) throw err;
  app.set('mongo', db); 
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/mapsAPICode', function(req, res){
  var URL = 'https://maps.googleapis.com/maps/api/js?v=3&libraries=places';
//  if (process.env.NODE_ENV === 'production'){
//      URL += '&key=' + process.env.GOOGLEAPIKEY;
//  }
  https.get(URL, function(response){
    res.set('Content-Type','text/javascript');
    response.pipe(res);
  });
});

app.post('/api/saveatrek', [jwtAuth], function(req, res){
  var trek = req.body.trek;
  if (req.user && (req.user._id.toString() === trek.userid)) {
    var db = app.get('mongo');
    var treks = db.collection('treks');
    treks.update({_id: ObjectId(trek.id)}, trek, {upsert: true}, function(err, updateRes){
      if(updateRes.result.upserted){
        res.end(updateRes.result.upserted[0]._id.toString());
      } else {
        res.end("trek updated");
      }
    });
  } else {
    res.end("not authorized");
  }
});

app.post('/api/deleteatrek/', [jwtAuth], function(req, res){
  var db = app.get('mongo');
  var treks = db.collection('treks');
  treks.find({_id: ObjectId(req.body.trekid)}).toArray(function(err, docs){
    if (docs[0].userid === req.user._id.toString()) {
      treks.remove({_id: ObjectId(req.body.trekid)}, {justOne : true}, function(status) {
        res.end('deleted');
      });
    } else {
      res.end('unauthorized');
    }
  });
});

app.get('/api/retrieveatrek/:trekid', function(req, res) {
	var db = app.get('mongo');
	var treks = db.collection('treks');
	treks.find({_id: ObjectId(req.params.trekid)}).toArray(function(err, docs) {
		res.json(docs);
	});
});

app.post('/api/retrievealltreks/', [jwtAuth], function(req, res) {
  if (req.user){
  var db = app.get('mongo');
  var treks = db.collection('treks');
  treks.find({userid: req.user._id.toString()}).toArray(function(err, docs) {
    res.json(docs);
  });
} else res.end("unauthorized");
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
      
      bcrypt.hash(req.body.password, 10, function(err, hash){
        users.insert({username: req.body.username, password: hash}, function(err, docs){
          if (err) throw err;
          res.json({
            token : authenticate(docs.ops[0]._id),
            user: {username: docs.ops[0].username, _id: docs.ops[0]._id }
          });
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
  users.find({username: req.body.username}).toArray(function(err, docs){
    if (err) throw err;
    if (docs.length === 1) {
      bcrypt.compare(req.body.password, docs[0].password, function(err, validpass) {
        if (err) console.log('password hash error');
        else if (validpass === true) {
          res.json({
            token : authenticate(docs[0]._id),
            user: docs[0]
          });
        } else {
          res.end('invalid username/password combo');
        }
      });
    } else {
      res.end('invalid username/password combo');
    }
  });
});

app.post('/api/passwordchange', [jwtAuth], function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  if (req.user) {
    users.find({_id: req.user._id}).toArray(function(err, docs){
      bcrypt.compare(req.body.oldpassword, docs[0].password, function(err, validpass) {
        if (err) console.log('password hash error');
        else if (validpass === true) {
          bcrypt.hash(req.body.newpassword, 10, function(err, hash){
          users.update({_id: req.user._id}, {username: req.user.username, password: hash}, function(err, updateRes){
            if(err) console.log('Could not insert');
            res.end(updateRes.result.n.toString());
          });
        });
        } else {
          res.end('invalid username/password combo');
        }
      });
    });
  }
});

app.post('/api/deleteaccount', [jwtAuth], function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  if (req.user) {
    users.remove({_id: req.user._id}, {justOne: true}, function(err, response) {
      res.json(response);
    });
  }

});

function authenticate (userid){
  var expires = moment().add(7, 'days').valueOf();
  var token = jwt.encode({
    iss: userid,
    exp: expires
  }, jwtKey);
  return token;
}

function jwtAuth (req, res, next){

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

  if (token) {
    try {
      var decoded = jwt.decode(token, jwtKey);
      if (decoded.exp <= Date.now()){
        res.end('Access token expired', 400);
      }
      var db = app.get('mongo');
      var users = db.collection('users');
      users.find({_id: ObjectId(decoded.iss)}, {password: 0}).toArray(function(err, docs) {
        req.user = docs[0];
        next();
      });
    } catch (err) {
      return next();
    }
  } else {
    next();
  }

};



app.listen(3000);

console.log("listening on port 3000");
