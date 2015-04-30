// this is interfaceController.js

angular.module('roadWarrior').controller('InterfaceController', ['$cookies', 'trekService', function($cookies, trekService){
  
  this.activePanel = 'currentTrek';

  var interface = document.getElementById('interface');
  
  this.tabSwitcher = function(tab){
    if (this.activePanel === tab){
      this.activePanel = null;
      document.getElementById(tab + 'Tab').classList.remove('activeTab');
      interface.classList.add('hideInterface');
    } else {
      if (this.activePanel){
        document.getElementById(this.activePanel + 'Tab').classList.remove('activeTab');
      } else {
        interface.classList.remove('hideInterface');
      }
      this.activePanel = tab;
      document.getElementById(tab + 'Tab').classList.add('activeTab');      
    }
  };

  if ($cookies.sharedTrek && $cookies.sharedTrek !== 'undefined'){
    var sharedTrek = JSON.parse($cookies.sharedTrek);
    trekService.renderSavedTrek(sharedTrek);
    this.tabSwitcher('trekList');
  }

}]);
