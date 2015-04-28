//  this is trekController.js

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'userService', function(trekService, legService, userService){

  this.legs = legService.legs;
  this.name = "new trek";

  this.treks = trekService.allTreks;

  this.showDetails = [];
  this.showEditName = false;

  var loadedTrek = null;

  this.loginToSave = false;

  this.toggleLoginToSave = function () {
    this.loginToSave = !this.loginToSave;
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
    trekService.allTreks.splice(trekService.allTreks.indexOf(trek), 1);
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
    if (userService.userState === 'loggedIn'){
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
    for (var i = 0; i < this.legs.length; i++){
      this.showDetails[i] = false;
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
