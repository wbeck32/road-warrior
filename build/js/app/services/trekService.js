// this is trekService.js

angular.module('roadWarrior').service('trekService', function(){

  this.allTreks = [];

  this.delete = function(trek){
    this.allTreks.splice(this.allTreks.indexOf(trek), 1);
  };

});
