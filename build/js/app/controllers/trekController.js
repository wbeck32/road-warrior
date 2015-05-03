//  this is trekController.js

angular.module('roadWarrior').controller('TrekController', ['trekService', 'legService', 'userService', function(trekService, legService, userService){

  this.legs = legService.legs;
  this.name = "new trek";
  this.totalDistance = function(){
    return this.legs.reduce(function(prev, leg, index, array){
      return prev + leg.getDistance();
    }, 0).toFixed(2);
  };
  
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
    if (trek.legs === this.legs) {
      this.clearMap();
    }
    trekService.delete(trek);
    trekService.allTreks.splice(trekService.allTreks.indexOf(trek), 1);
  };

  this.removeLeg = function(leg){
    leg.remove();
    if (this.legs.length === 0 && loadedTrek) {
      this.deleteTrek(loadedTrek);
    }
  };
  
  this.clearMap = function(){
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = "new trek";
    loadedTrek = null;
  };

    
  this.saveTrek = function(){
    if (this.legs.length > 0) {
      if (userService.userState === 'loggedIn'){
        if (!loadedTrek){
          loadedTrek = {
            name: this.name,
            legs: this.legs
          };
          trekService.allTreks.push(loadedTrek);
          this.treks = trekService.allTreks;
        } 
        else {
          loadedTrek.name = this.name;
        }
        var saveTrek = document.getElementById('saveTrek');
        saveTrek.setAttribute('style', 'color: green');
        window.setTimeout(function(){
          saveTrek.setAttribute('style', 'color: black');
        }, 1000);
        trekService.saveTrek(loadedTrek);
      } else {
        this.toggleLoginToSave();
      }
    }
  };

  this.editName = function(){
    if(this.name.length > 0) {
      this.showEditName = !this.showEditName;
    }
  };

}]);
