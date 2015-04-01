// this is trekService.js

angular.module('roadWarrior').service('trekService', ['$http', 'markerFactory', 'legService', function($http, markerFactory, legService){

  this.allTreks = [];

  var self = this;

  this.delete = function(trek){
    $http({
      method: 'DELETE',
      url:'/api/deleteatrek/'+trek.id
    }).success(function(data, status, headers, config){
      console.log('delete: ', status);
      self.allTreks.splice(self.allTreks.indexOf(trek), 1);
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
      data: {trek: parseTrek(loadedTrek)},
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
    var legs = [];
    var origGoogleLatLng = new google.maps.LatLng(trek.markers[0].k, trek.markers[0].D);
    var currentOrigin = markerFactory.create(origGoogleLatLng, legService, true);
    currentOrigin.name = trek.markers[0].name;
    for(var i = 1; i < trek.markers.length; i++) {
      var destGoogleLatLng = new google.maps.LatLng(trek.markers[i].k, trek.markers[i].D);
      var dest = markerFactory.create(destGoogleLatLng, legService, true);
      dest.name = trek.markers[i].name;
      var newLeg = legService.createLeg(currentOrigin, dest, true);
      legs.push(newLeg);
      currentOrigin = dest; 
    }
    console.log(trek.name);
    this.allTreks.push({name: trek.name, legs: legs, id: trek._id}); 
    console.log(this.allTreks[0]);
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

}]);
