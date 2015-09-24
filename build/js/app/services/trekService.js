// this is trekService.js

angular.module('roadWarrior').service('trekService', ['$http', 'markerFactory', 'legService', function($http, markerFactory, legService){

  this.allTreks = [];

  var self = this;

  this.delete = function(trek){
    $http({
      method: 'POST',
      url:'/api/deleteatrek/',
      data: {trekid: trek.id, access_token: window.localStorage.getItem('token')}
    }).success(function(data, status, headers, config){
      console.log('delete: ', status, data);
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  function parseTrek(trek) {
    var origin, marker;
    var latLngArray = [];
    origin = trek.legs[0].origin.getPosition();
    origin.name = trek.legs[0].origin.name;
    latLngArray.push(origin);
    for (var i = 0; i < trek.legs.length; i++) {
      marker = trek.legs[i].dest.getPosition();
      marker.name = trek.legs[i].dest.name;
      marker.travelMode = trek.legs[i].travelMode;
      latLngArray.push(marker);
    }
    return {markers: latLngArray,
            name: trek.name,
            id: trek.id,
            userid: window.localStorage.getItem('userid')
    };
  }

  this.saveTrek = function(loadedTrek){
    $http({
      method: 'POST',
      url:'/api/saveatrek', 
      data: {trek: parseTrek(loadedTrek), access_token: window.localStorage.getItem('token')},
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config){
        if (data) {
          loadedTrek.id = data;
        }
    }).error(function(data, status, headers, config){
      console.log('failure');
    });
  };

  this.renderSavedTrek = function(trek) {
    markerFactory.resetIndex();
    var legs = [];
    var origGoogleLatLng = new google.maps.LatLng(trek.markers[0].A, trek.markers[0].F);
    var currentOrigin = markerFactory.create(origGoogleLatLng, legService, true);
    currentOrigin.name = trek.markers[0].name;
    for(var i = 1; i < trek.markers.length; i++) {
      var destGoogleLatLng = new google.maps.LatLng(trek.markers[i].A, trek.markers[i].F);
      var dest = markerFactory.create(destGoogleLatLng, legService, true);
      dest.name = trek.markers[i].name;
      var newLeg = new legService.Leg(currentOrigin, dest, trek.markers[i].travelMode);
      legs.push(newLeg);
      currentOrigin = dest; 
    }
    this.allTreks.push({name: trek.name, legs: legs, id: trek._id}); 
    markerFactory.resetIndex();
  };

  this.renderAllSavedTreks = function() {
    $http({
      method: 'POST',
      url:'/api/retrievealltreks/',
      data: {access_token: window.localStorage.getItem('token')}
    }).success(function(data, status, headers, config){
      if (data !== "Access token expired") {
        data.forEach(function(trek){
          self.renderSavedTrek(trek);
        });
      } else {
        window.alert("Access token expired! Please log out and log back in.");
      }
    }).error(function(data, status, headers, config){
      console.log('no response from Treksmith API');
    });
  };

}]);
