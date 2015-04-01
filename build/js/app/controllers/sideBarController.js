// this is sideBarController.js

angular.module('roadWarrior').controller('SideBarController', ['$http', 'legService', 'trekService', function($http, legService, trekService){
  
  var sideMenu = document.getElementById('sideMenu');
  var sidebarContent = document.getElementById('sidebarContent');
  var currentTab = null;
  var noAccount = false;
  var activePanel = [true, false, false, false];
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
