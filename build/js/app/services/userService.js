// this is userService.js

angular.module('roadWarrior').service('userService', ['$http', 'trekService', 'legService', function($http, trekService, legService){

  this.username = null;
  this.userState = 'loggedOut';
  this.dupeUsername = false;

  var self = this;

  if (window.localStorage.getItem('token')) {
    trekService.renderAllSavedTreks();
    this.username = window.localStorage.getItem('user');
    this.userState = 'loggedIn';
  }

  this.logIn = function(username, password, cb) {
    $http({
      method: 'POST',
      url:'/api/login', 
      data: {username: username, password: password},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      if (data.token) {
        window.localStorage.setItem("token", data.token);
        window.localStorage.setItem("user", data.user.username);
        window.localStorage.setItem("userid", data.user._id);
        trekService.renderAllSavedTreks();
        self.username = data.user.username;
        self.userState = 'loggedIn';
        cb();
      }
    }).error(function(data, status, headers, config){
      console.log('login failure');
    });
  };

  this.signOut = function(){
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('userid');
    this.username = null;
    this.userState = 'loggedOut';
    legService.unRenderAll();
    trekService.allTreks.splice(0,trekService.allTreks.length);
  };

  this.createAccount = function(username, password, email, cb) {
    $http({
      method: 'POST',
      url:'/api/signup', 
      data: {username: username, password: password, email: email},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      if (data.token) {
        window.localStorage.setItem("token", data.token);
        window.localStorage.setItem("user", data.user.username);
        window.localStorage.setItem('userid', data.user._id);
        self.username = data.user.username;
        self.userState = 'loggedIn';
        cb();
      }
    }).error(function(data, status, headers, config){
      console.log('failed to create account');
    });
  };

  this.checkUsername = function(username, cb) {
    $http({
      method: 'POST',
      url: 'api/usercheck',
      data: {username: username},
      headers: {'Content-Type':'application/json'}
    }).success(function(data, status, headers, config){
      var result = parseInt(data);
      if(result > 0){
        self.dupeUsername = true;          
      } else {
        self.dupeUsername = false;
      }
      cb();
    }).error(function(data, status, headers, config){
      console.log('Failure.');
    });
  };

  this.passwordChange = function(password, newPassword) {
    $http({
      method: 'POST',
      url: '/api/passwordchange',
      data: {
        password: password,
        newpassword: newPassword,
        username: this.username,
        access_token: window.localStorage.getItem('token')
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      if(data === '1') {
        alert("Password Changed!");
      } else {
        alert("Sorry, there was an error processing your request");
      }
    }).error(function(data, status, headers, config){
      console.log('password change error');
    });
  };

  this.resetPassword = function(username) {
    $http({
      method: 'POST',
      url: '/api/passwordresetemail',
      data: {
        username: username
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      console.log('reset post successful');
      alert('An email has been sent to your account, go check it out to proceed. You can close this window.');
    }).error(function(data, status, headers, config){
      console.log('reset post failed: ' + data);
    });
  };

  this.deleteAccount = function(cb) {
    $http({
      method: 'POST',
      url: '/api/deleteaccount',
      data: {
        username: this.username,
        access_token: window.localStorage.getItem('token')
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      console.log(data);
      self.signOut();
      cb();
    }).error(function(data, status, headers, config){
      console.log(data);
    });
  };

}]);
