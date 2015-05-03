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
    this.newPassword = null;
  }.bind(this);

  var dupeUsername = function(){
    this.dupeUsername = userService.dupeUsername;
  }.bind(this);

  this.changeUserState = function(state){
    userService.userState = state;
    updateScope();
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
    } else {
      userService.dupeUsername = null;
      dupeUsername();
    }
  };

  this.passwordChange = function() {
    userService.passwordChange(this.password, this.newPassword);
    this.togglePasswordChange();
  };

  this.resetPassword = function() {
    if(this.username && this.username.length > 0){
      userService.resetPassword(this.username);
    } else {
      var noUsername = document.getElementById('noUsername');
      noUsername.setAttribute('style', 'color: red');
      window.setTimeout(function(){
        noUsername.setAttribute('style', 'color: transparent');
      }, 3000);      
    }
  };

  this.deleteAccount = function(){
    userService.deleteAccount(updateScope);
  };

  this.togglePasswordChange = function() {
    updateScope();
    this.showPasswordChange = !this.showPasswordChange;
  };

  this.toggleDeleteAccount = function() {
    this.showDeleteAccount = !this.showDeleteAccount;
  };

  this.requiredErrors = function(form){
    if (
      (form.username && form.username.$invalid && form.username.$touched) ||
        (form.password.$invalid && form.password.$touched) ||
        (form.confirmPassword.$invalid && form.confirmPassword.$touched) ||
        (form.newPassword && form.newPassword.$invalid && form.newPassword.$touched) ) return true;
    else return false;
  };

}]);
