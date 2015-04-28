// this is interfaceController.js

angular.module('roadWarrior').controller('InterfaceController', ['$cookies', 'trekService', function($cookies, trekService){
  
  this.activePanel = 'currentTrek';

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
