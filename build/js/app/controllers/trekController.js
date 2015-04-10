//  this is trekController.js

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', '$http', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory, $http){

  this.legs = legService.legs;
  this.name = "new trek";

  this.treks = trekService.allTreks;

  this.showDetails = [];
  this.showEditName = false;

  var loadedTrek = null;
  var self = this;

  this.loginToSave = false;

  this.toggleLoginToSave = function () {
    this.loginToSave = !this.loginToSave;
  };

  this.signOut = function(){
    this.clearTrek();
    trekService.allTreks = [];
    this.treks = trekService.allTreks;
  };

  this.markerName = function(marker){
    if(marker.name){
      return ": " + marker.name;
    } else return "";
  };
  
  this.renderTrek = function(trek){
    legService.unRenderAll();
    legService.legs = trek.legs;
    legService.renderAll();
    this.legs = trek.legs;
    this.name = trek.name;
    this.hideFields();
    loadedTrek = trek;
  };

  this.deleteTrek = function(trek){   
    trekService.delete(trek);
    if (trek.legs === this.legs) {
      this.clearTrek();
    }
  };

  this.clearTrek = function(){
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = "new trek";
    loadedTrek = null;
  };

    
  this.saveTrek = function(){
    if (window.localStorage.getItem('token')){
      if (!loadedTrek){
        if(this.legs.length > 0){
          loadedTrek = {
            name: this.name,
            legs: this.legs
          };
          trekService.allTreks.push(loadedTrek);
        }
      } 
      else {
        loadedTrek.name = this.name;
      }
      trekService.saveTrek(loadedTrek);
      loadedTrek = null;
      legService.unRenderAll();
      this.legs = legService.legs;
      this.name = "new trek";
    } else {
      this.toggleLoginToSave();
    }
    
  };


  this.hideFields = function(){
    for (var i = 0; i < self.legs.length; i++){
      self.showDetails[i] = false;
    }
  };

  this.removeLeg = function(index){
    legService.removeLeg(index);
    this.hideFields();
  };

  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };

  this.editName = function(){
    this.showEditName = !this.showEditName;
  };

}]);
