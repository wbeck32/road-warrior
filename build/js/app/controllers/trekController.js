//  this is trekController.js

angular.module('roadWarrior').controller('TrekController', ['trekService', 'legService', 'userService', function(trekService, legService, userService){

  this.legs = legService.legs;
  this.name = "new trek";

  this.treks = trekService.allTreks;
  
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
    loadedTrek = trek;
  };

  this.deleteTrek = function(trek){   
    trekService.delete(trek);
    trekService.allTreks.splice(trekService.allTreks.indexOf(trek), 1);
    if (trek.legs === this.legs) {
      this.clearMap();
    }
  };

  this.clearMap = function(){
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = "new trek";
    loadedTrek = null;
  };

    
  this.saveTrek = function(){
    if (legService.legs.length > 0) {
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
    }
  };

  this.editName = function(){
    this.showEditName = !this.showEditName;
  };

}]);
