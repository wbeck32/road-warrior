// this is jwtauth.js

var jwt = require('jwt-simple');

module.exports = function(req, res, next){

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

  if (token) {

    try {
      var decoded = jwt.decode(token, app.get('jwtKey'));
      if (decoded.exp <= Date.now()){
        res.end('Access token expired', 400);
      }

    } catch (err) {
      return next();
    }
  } else {
    next();
  }

};
