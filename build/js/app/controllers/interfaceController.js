// this is interfaceController.js

angular.module('roadWarrior').controller('InterfaceController', ['$http', '$cookies', 'legService', 'trekService', function($http, $cookies, legService, trekService){
  
  var interface = document.getElementById('interface');
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

      loadTab(tab);
    } else if (currentTab === tab){
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

  if ($cookies.sharedTrek && $cookies.sharedTrek !== 'undefined'){
    var sharedTrek = JSON.parse($cookies.sharedTrek);
    trekService.renderSavedTrek(sharedTrek);
    this.tabSwitcher('trekList');
  }

}]);
