// this is userController.js

angular.module('roadWarrior').controller('UserController', ['$scope', '$http', 'trekService', function($scope, $http, trekService){

  this.username = null;
  this.password = null;
  this.email = null;
  this.dupeUsername = false;
  this.verifyPasswordFail = false;
  this.showPasswordChange = false;
  this.showDeleteAccount = false;
  this.noSuchUser = false;
  this.resetEmailSent = false;
  var self = this;

  if (window.localStorage.getItem('token')) {
    trekService.renderAllSavedTreks();
    this.username = window.localStorage.getItem('user');
  }

  this.suppressErrors = function(){
    this.resetEmailSent = false;
  };
  
  this.signOut = function(){
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('userid');
    this.username = null;
    this.password = null;
    this.verify = null;
    this.email = null;
  };

  this.toggleNoSuchUser = function () {
    this.noSuchUser = !this.noSuchUser;
  };

  this.logIn = function () {
    this.resetEmailSent = false;
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
          self.noSuchUser = false;
          trekService.renderAllSavedTreks();
        } else {
          self.toggleNoSuchUser();

        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.createAccount = function () {
    $http({
      method: 'POST',
      url:'/api/signup', 
      data: {username: this.username, password: this.password, email: this.email},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data.token) {
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
      if(data === '1') {
        alert("Password Changed!");
        self.oldPassword = null;
        self.newPassword = null;
        self.verifyNewPassword = null;
        self.togglePasswordChange();
      } else {
        alert("Sorry, there was an error processing your request");
      }
    }).error(function(data, status, headers, config){
      console.log('password change error');
    });
  };

  this.resetPassword = function() {
    this.resetEmailSent = true;
    $http({
      method: 'POST',
      url: '/api/passwordresetemail',
      data: {
        username: this.username
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      console.log('reset post successful');
    }).error(function(data, status, headers, config){
      console.log('reset post failed: ' + data);
    });
  };



  this.deleteAccount = function() {
    $http({
      method: 'POST',
      url: '/api/deleteaccount',
      data: {
        username: window.localStorage.getItem('username'),
        access_token: window.localStorage.getItem('token')
      },
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
      console.log(data);
      self.signOut();
    }).error(function(data, status, headers, config){
      console.log(data);
    });
  };

  this.cancelPasswordChange = function () {
    this.oldPassword = null;
    this.newPassword = null;
    this.verifyNewPassword = null;
    this.togglePasswordChange();
  };

  this.togglePasswordChange = function() {
    this.showPasswordChange = !this.showPasswordChange;
  };

  this.toggleDeleteAccount = function() {
    this.showDeleteAccount = !this.showDeleteAccount;
  };

  this.accountInfo = function(){
    if (window.localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  };

}]);
