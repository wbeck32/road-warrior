// this is interfaceController.js

angular.module('roadWarrior').controller('InterfaceController', ['$http', '$cookies', 'legService', 'trekService', function($http, $cookies, legService, trekService){
  
  var noAccount = false;

  this.activePanel = 'currentTrek';

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

  this.tabSwitcher = function(tab){
    if (this.activePanel === tab){
      this.activePanel = null;
      document.getElementById(tab + "Tab").className = "tab";
      document.getElementById('interface').className = "interfaceContainer hideInterface";
    } else {
      if (this.activePanel){
        document.getElementById(this.activePanel + "Tab").className = "tab";
      } else {
        document.getElementById('interface').className = "interfaceContainer showInterface";
      }
      this.activePanel = tab;
      document.getElementById(tab + "Tab").className = "tab activeTab";      
    }
  };

  if ($cookies.sharedTrek && $cookies.sharedTrek !== 'undefined'){
    var sharedTrek = JSON.parse($cookies.sharedTrek);
    trekService.renderSavedTrek(sharedTrek);
    this.tabSwitcher('trekList');
  }

}]);
