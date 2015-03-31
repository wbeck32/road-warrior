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

  this.signOut = function(){
    window.localStorage.removeItem("token");
    this.clearTrek();
    trekService.allTreks = [];
    this.treks = trekService.allTreks;
  };
  
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

  this.renderSavedTrek = function(data) {
    var legs = [];
    console.log(data);
    var origGoogleLatLng = new google.maps.LatLng(data.markers[0].k, data.markers[0].D);
    var currentOrigin = markerFactory.create(origGoogleLatLng, legService, true);
    currentOrigin.name = data.markers[0].name;
    for(var i = 1; i < data.markers.length; i++) {
      console.log(i);
      var destGoogleLatLng = new google.maps.LatLng(data.markers[i].k, data.markers[i].D);
      var dest = markerFactory.create(destGoogleLatLng, legService, true);
      dest.name = data.markers[i].name;
      var newLeg = legService.createLeg(currentOrigin, dest, true);
      legs.push(newLeg);
      currentOrigin = dest; 
    }
    trekService.allTreks.push({name: data.name, legs: legs, id: data._id}); 
    markerFactory.resetIndex();
  };

  this.renderAllSavedTreks = function() {
    $http({
      method: 'GET',
      url:'/api/retrievealltreks'
    }).success(function(data, status, headers, config){
        data.forEach(function(trek){
          self.renderSavedTrek(trek);
        });
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.renderAllSavedTreks();

  this.deleteTrek = function(trek){
    
    $http({
      method: 'DELETE',
      url:'/api/deleteatrek/'+trek.id
    }).success(function(data, status, headers, config){
        console.log('delete: ', status);
    }).error(function(data, status, headers, config){
      console.log('failure');
    });

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
        if (data) {
          loadedTrek.id = data;
        }
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
    var origin, marker;
    var latLngArray = [];
    origin = self.legs[0].origin.getPosition();
    origin.name = self.legs[0].origin.name;
    latLngArray.push(origin);
    for (var i = 0; i < self.legs.length; i++) {
      marker = self.legs[i].dest.getPosition();
      marker.name = self.legs[i].dest.name;
      latLngArray.push(marker);
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

angular.module('roadWarrior').controller('SideBarController', ['$http', 'legService', 'trekService', function($http, legService, trekService){
  
  var sideMenu = document.getElementById('sideMenu');
  var sidebarContent = document.getElementById('sidebarContent');
  var currentTab = null;
  var noAccount = false;
  var activePanel = [true, false, false, false];

  this.showLogIn = function () {
    if (window.localStorage.getItem("token") || noAccount) {
      return false;
    } else {
      return true;
    }
  };

  this.logIn = function () {
    $http({
      method: 'POST',
      url:'/api/login', 
      data: {username: this.username, password: this.password},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data.token) {
          window.localStorage.setItem("token", data.token);
          loadTab('trekList');
        } else {
          alert("No such user!");
        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.showCreateAccount = function() {
    return noAccount;
  };

  this.createAccount = function () {
    // TODO: verify that password = verified password 
    $http({
      method: 'POST',
      url:'/api/signup', 
      data: {username: this.username, password: this.password},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data) {
          window.localStorage.setItem("token", data.token);
          loadTab('currentTrek');
        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.accountInfo = function(){
    if (window.localStorage.getItem("token")) {
      return true;
    } else {
      return false;
    }
  };

  this.toggleAccountActions = function () {
    noAccount = !noAccount;
  };

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
      activePanel = [true, false, false, false];
    } else if (tab === 'trekList') {
      activePanel = [false, true, false, false];
    } else if (tab === 'directions') {
      activePanel = [false, false, true, false];
    } else if (tab === 'account') {
      activePanel = [false, false, false, true];
    }
    if(currentTab){
      document.getElementById(currentTab + "Tab").className = "tab";
    }
    document.getElementById(tab + "Tab").className = "tab activeTab";
    currentTab = tab;
  }

}]);
