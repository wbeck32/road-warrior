// this is userController.js

angular.module('roadWarrior').controller('UserController', ['$scope', '$http', 'trekService', function($scope, $http, trekService){

  this.username = null;
  this.password = null;
  this.dupeUsername = false;
  this.verifyPasswordFail = false;
  this.showPasswordChange = false;
  var self = this;

  if (window.localStorage.getItem('token')) {
    trekService.renderAllSavedTreks();
    this.username = window.localStorage.getItem('user');
  }

  this.signOut = function(){
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('userid');
    this.username = null;
    this.password = null;
    this.verify = null;
  };

  this.logIn = function () {
    $http({
      method: 'POST',
      url:'/api/login', 
      data: {username: this.username, password: this.password},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data.token) {
          window.localStorage.setItem("token", data.token);
          window.localStorage.setItem("user", data.user.username);
          window.localStorage.setItem("userid", data.user._id);
          trekService.renderAllSavedTreks();
        } else {
          alert("No such user!");
        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.createAccount = function () {
    $http({
      method: 'POST',
      url:'/api/signup', 
      data: {username: this.username, password: this.password},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data) {
          window.localStorage.setItem("token", data.token);
          window.localStorage.setItem("user", data.user.username);
          window.localStorage.setItem('userid', data.user._id);
        }
    }).error(function(data, status, headers, config){
      console.log('Give up now.');
    });
  };

  this.checkUsername = function() {
    if(this.username) {
      $http({
        method: 'POST',
        url: 'api/usercheck',
        data: {username: this.username},
        headers: {'Content-Type':'application/json'}
      }).success(function(data, status, headers, config){
        var result = parseInt(data);
        if(result > 0){
          self.dupeUsername = true;          
        } else {
          self.dupeUsername = false;
        }
      }).error(function(data, status, headers, config){
        console.log('Failure.');
      });
    } 
  };

  this.verifyPassword = function(password, verify) {

    if (password !== verify) {
        this.verifyPasswordFail = true;
    }
    else {
      this.verifyPasswordFail = false;
    }
  };

  this.passwordChange = function() {
    $http({
      method: 'POST',
      url: '/api/passwordchange',
      data: {
        oldpassword: this.oldPassword,
        newpassword: this.newPassword,
        username: this.username,
        access_token: window.localStorage.getItem('token')
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      if(data.nModified === 0) {
        alert("Sorry, there was an error processing your request");
      } else {
        alert("Password Changed!");
        self.oldPassword = null;
        self.newPassword = null;
        self.verifyNewPassword = null;
        self.togglePasswordChange();
      }
    }).error(function(data, status, headers, config){
      console.log('password change error');
    });

  };

  this.togglePasswordChange = function() {
    this.showPasswordChange = !this.showPasswordChange;
  };

  this.accountInfo = function(){
    if (window.localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  };

}]);
