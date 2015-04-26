// this is userService.js

angular.module('roadWarrior').service('userService', ['trekService', function(trekService){

  this.username = null;

  if (window.localStorage.getItem('token')) {
    trekService.renderAllSavedTreks();
    this.username = window.localStorage.getItem('user');
  }

}]);
