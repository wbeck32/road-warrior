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
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var mailgunLogin = require('./mailgunlogin.js');
var transporter = nodemailer.createTransport(smtpTransport({
  host: 'smtp.mailgun.org',
  auth: {
    user: mailgunLogin.user,
    pass: mailgunLogin.pass
  }
}));

var jwtKey = process.env.JWTKEY;

mongoClient.connect(url, function(err, db){
  if (err) throw err;
  app.set('mongo', db); 
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', __dirname + '/public/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/mapsAPICode', function(req, res){
  var URL = 'https://maps.googleapis.com/maps/api/js?v=3&libraries=places,geometry';
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
    if(docs.length === 1) {
      res.cookie('sharedTrek', JSON.stringify(docs[0]));
    }
    res.redirect('/');
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
        users.insert({username: req.body.username, password: hash, email: req.body.email}, function(err, docs){
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
  } else {
    res.end('unauthorized');
  }
});

app.post('/api/passwordresetemail', function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  users.find({username: req.body.username}).toArray(function(err, docs){
    if (err) console.log(err);
    if (docs[0].email) {
      var resetPasswordMailOptions = {
        from: 'Treksmith <hello@treksmith.com>', // sender address
        to: docs[0].email, 
        subject: 'Treksmith password reset', // Subject line
        text: 'Please click on this link to reset your password', // plaintext body
        html: '<div>Hello, </div><div>Please click <a href=http://www.treksmith.com/api/passwordreset/' + passwordResetAuthenticate(docs[0]._id) + '>here</a> to reset your password. This link will only be valid for 24 hours.</div><div>Thanks!</div><div>The Treksmith</div>' // html body
      };
      transporter.sendMail(resetPasswordMailOptions, function(err, info) {
        if (err) console.log(err);  
        console.log('Email sent!');
        res.end('Email sent!');
      });
    } else {
      res.end('Cannot reset password for this user');
    }
  });
});

app.get('/api/passwordreset/:token', [jwtAuth], function(req, res) {
  res.render('passwordreset.html');
});

app.post('/api/passwordreset/:token', [jwtAuth], function(req, res){
  var db = app.get('mongo');
  var users = db.collection('users');
  res.redirect('/');
  bcrypt.hash(req.body.password, 10, function(err, hash){
    users.update({_id: req.user._id}, {$set:{password: hash}}, function(err, updateRes){
      if (err) throw err;
    });  
  });
});

app.post('/api/deleteaccount', [jwtAuth], function(req, res) {
  var db = app.get('mongo');
  var users = db.collection('users');
  if (req.user) {
    users.remove({_id: req.user._id}, {justOne: true}, function(err, response) {
      res.json(response);
    });
  } else {
    res.end('unauthorized');
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

function passwordResetAuthenticate (userid){
  var expires = moment().add(1, 'hours').valueOf();
  var token = jwt.encode({
    iss: userid,
    exp: expires
  }, jwtKey);
  return token;
}

function jwtAuth (req, res, next){

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'] || req.params.token;
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
