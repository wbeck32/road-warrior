// this is controllers.js

// Trek Controller

// 5511ec05bad818c26b8f3784 angels and bunnies id

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', '$http', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory, $http){

  this.legs = legService.legs;
  this.name = legService.name;

  this.treks = trekService.allTreks;

  this.showDetails = [];
  this.showEditName = false;

  var loadedTrek = null;
  
  this.markerName = function(marker){
    if(marker.name){
      return ": " + marker.name;
    } else return "";
  };

  var self = this;
  
  this.renderTrek = function(trek){
    legService.unRenderAll();
    legService.legs = trek.legs;
    legService.name = trek.name;
    legService.renderAll();
    this.legs = legService.legs;
    this.name = legService.name;
    this.hideFields();
    loadedTrek = trek;
  };

  this.renderSavedTrek = function() {
    $http({
      method: 'GET',
      url:'/api/retrieveatrek/' + '5511ec05bad818c26b8f3785' 
    }).
      success(function(data, status, headers, config){
        console.log(data);
        self.name = data[0].name;
        data[0].markers.forEach(function(latLng) {
          console.log(typeof latLng.k);
          var googleLatLng = new google.maps.LatLng(latLng.k, latLng.D);
          var marker = markerFactory.create(googleLatLng, legService);
          legService.addLeg(marker);  
        });
    }).error(function(data, status, headers, config){
      console.log('failure');
    });

  };

  this.renderSavedTrek();

  this.deleteTrek = function(trek){
    trekService.delete(trek);
    if (trek.legs === this.legs) {
      this.clearTrek();
    }
  };

  this.clearTrek = function(){
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
    loadedTrek = null;
  };
    
  this.saveTrek = function(){
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
    $http({
      method: 'POST',
      url:'/api/saveatrek', 
      data: {trek: parseTrek()},
      headers: {'Content-Type': 'application/json'}
    }).
      success(function(data, status, headers, config){
      loadedTrek.id = data;
      console.log(loadedTrek);
      loadedTrek = null;
    }).error(function(data, status, headers, config){
      console.log('failure');
      loadedTrek = null;
    });
    legService.unRenderAll();
    this.legs = legService.legs;
    this.name = legService.name;
  };

  function parseTrek() {
    var latLngArray = [];
    latLngArray.push(self.legs[0].origin.getPosition());
    for (var i = 0; i < self.legs.length; i++) {
      latLngArray.push(self.legs[i].dest.getPosition());
    }
    return {markers: latLngArray,
            name: self.name,
            id: loadedTrek.id
    };
  }

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

angular.module('roadWarrior').controller('SideBarController', function(){
  
  var sideMenu = document.getElementById('sideMenu');
  var sidebarContent = document.getElementById('sidebarContent');
  var currentTab = null;

  var activePanel = [true, false, false];

  this.activePanel = function(index){
    return activePanel[index];
  };

  this.tabSwitcher = function(tab){
    if (!currentTab){
      sideMenu.className = "showMenu";
      loadTab(tab);
    } else if (currentTab === tab){
      sideMenu.className = "hideMenu";
      document.getElementById(currentTab + "Tab").className = "tab";
      currentTab = null;
    } else {
      loadTab(tab);
    }
  };

  function loadTab(tab){
    if (tab === 'currentTrek') {
      activePanel = [true, false, false];
    } else if (tab === 'trekList') {
      activePanel = [false, true, false];
    } else if (tab === 'directions') {
      activePanel = [false, false, true];
    }
    if(currentTab){
      document.getElementById(currentTab + "Tab").className = "tab";
    }
    document.getElementById(tab + "Tab").className = "tab activeTab";
    currentTab = tab;
  }

});
