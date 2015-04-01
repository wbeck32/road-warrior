// this is sideBarController.js

angular.module('roadWarrior').controller('SideBarController', ['$http', 'legService', 'trekService', function($http, legService, trekService){
  
  var sideMenu = document.getElementById('sideMenu');
  var sidebarContent = document.getElementById('sidebarContent');
  var currentTab = null;
  var noAccount = false;
  var activePanel = [true, false, false, false];
  this.dupeUsername = false;
  this.verifyPasswordFail = false;
  var self = this;

  this.showLogIn = function () {
    if (window.localStorage.getItem("token") || noAccount) {
      return false;
    } else {
      return true;
    }
  };

  this.showCreateAccount = function() {
    if (window.localStorage.getItem("token")) {
      return false;
    } else {
      return noAccount;
    }
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

  this.createAccount = function () {
    // TODO: verify that password = verified password 
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
          loadTab('currentTrek');
        }
    }).error(function(data, status, headers, config){
      console.log('Give up now.');
    });
  };

  this.verifyPassword = function() {
    if (this.password !== this.verify) {
        this.verifyPasswordFail = true;
    }
    else {
      this.verifyPasswordFail = false;
    }
  };

  this.accountInfo = function(){
    if (window.localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  };

  this.toggleAccountActions = function () {
    noAccount = !noAccount;
  };

  this.activePanel = function(index){
    return activePanel[index];
  };

  this.tabSwitcher = function(tab){
    if (!currentTab){
      sideMenu.className = "showMenu";
      loadTab(tab);
    } else if (currentTab === tab){
      sideMenu.className = "hideMenu";
      document.getElementById(currentTab + "Tab").className = "tab";
      currentTab = null;
    } else {
      loadTab(tab);
    }
  };


  function loadTab(tab){
    if (tab === 'currentTrek') {
      activePanel = [true, false, false, false];
    } else if (tab === 'trekList') {
      activePanel = [false, true, false, false];
    } else if (tab === 'about') {
      activePanel = [false, false, true, false];
    } else if (tab === 'account') {
      activePanel = [false, false, false, true];
    }
    if(currentTab){
      document.getElementById(currentTab + "Tab").className = "tab";
    }
    document.getElementById(tab + "Tab").className = "tab activeTab";
    currentTab = tab;
  }

}]);
