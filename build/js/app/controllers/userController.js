// this is userController.js

angular.module('roadWarrior').controller('UserController', ['userService', function(userService){

  this.username = userService.username;
  this.userState = userService.userState;
  this.dupeUsername = userService.dupeUsername;

  this.password = null;
  this.email = null;
  this.passwordConfirmation = null;

  this.showPasswordChange = false;
  this.showDeleteAccount = false;

  
  var updateScope = function() {
    this.username = userService.username;
    this.userState = userService.userState;
    this.password = null;
    this.email = null;
    this.passwordConfirmation = null;
  }.bind(this);

  var dupeUsername = function(){
    this.dupeUsername = userService.dupeUsername;
  }.bind(this);

  this.changeUserState = function(state){
    userService.userState = state;
    this.userState = userService.userState;
  };

  this.signOut = function(){
    userService.signOut();
    updateScope();
  };

  this.logIn = function () {
    userService.logIn(this.username, this.password, updateScope);
  };

  this.createAccount = function () {
    userService.createAccount(this.username, this.password, this.email, updateScope);
  };

  this.checkUsername = function() {
    if(this.username){
      userService.checkUsername(this.username, dupeUsername);
    }
  };

  this.passwordChange = function() {
    userService.passwordChange(this.oldPassword, this.newPassword);
    this.oldPassword = null;
    this.newPassword = null;
    this.passwordConfirmation = null;
    this.togglePasswordChange();
  };

  this.resetPassword = function() {
    userService.resetPassword(this.username);
  };

  this.deleteAccount = function(){
    userService.deleteAccount(updateScope);
  };

  this.cancelPasswordChange = function () {
    this.oldPassword = null;
    this.newPassword = null;
    this.passwordConfirmation = null;
    this.togglePasswordChange();
  };

  this.togglePasswordChange = function() {
    this.showPasswordChange = !this.showPasswordChange;
  };

  this.toggleDeleteAccount = function() {
    this.showDeleteAccount = !this.showDeleteAccount;
  };

}]);
