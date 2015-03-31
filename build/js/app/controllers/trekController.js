// Trek Controller

angular.module('roadWarrior').controller('TrekController', [ 'trekService', 'legService', 'pathElevationService', 'neighborsService', 'mapFactory', 'markerFactory', '$http', function(trekService, legService, pathElevationService, neighborsService, mapFactory, markerFactory, $http){

  this.legs = legService.legs;
  this.name = legService.name;

  this.treks = trekService.allTreks;

  this.showDetails = [];
  this.showEditName = false;

  var loadedTrek = null;

  this.signOut = function(){
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    window.localStorage.removeItem('userid');
    this.username = null;
    this.password = null;
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
    var origGoogleLatLng = new google.maps.LatLng(data.markers[0].k, data.markers[0].D);
    var currentOrigin = markerFactory.create(origGoogleLatLng, legService, true);
    currentOrigin.name = data.markers[0].name;
    for(var i = 1; i < data.markers.length; i++) {
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
      url:'/api/retrievealltreks/' + window.localStorage.getItem('userid')
    }).success(function(data, status, headers, config){
        data.forEach(function(trek){
          self.renderSavedTrek(trek);
        });
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
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
          window.localStorage.setItem("user", data.user.username);
          window.localStorage.setItem("userid", data.user._id);
          //loadTab('trekList');
          self.renderAllSavedTreks();
        } else {
          alert("No such user!");
        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

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
    }).success(function(data, status, headers, config){
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
            id: loadedTrek.id,
            userid: window.localStorage.getItem('userid')
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
