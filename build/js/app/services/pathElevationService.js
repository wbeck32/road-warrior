// this is pathElevationService.js

angular.module('roadWarrior').factory('pathElevationService', ['mapFactory', 'elevationProfileFactory', function(mapFactory, elevationProfileFactory){
  
  var pathElevator = new google.maps.ElevationService();  

  return function(leg, legArray) {
    
    var latLngArray = [], path;

    if (leg.travelMode !== "CROW") {
      var steps = leg.rend.getDirections().routes[0].legs[0].steps;
      for (var i = 0; i < steps.length; i++) {
        for (var j = 0; j < steps[i].path.length; j++) {
          latLngArray.push(steps[i].path[j]);
        }
      }
      
      if(latLngArray.length > 200) {
        var incr = Math.ceil(latLngArray.length/200);
        var newLatLngArray = [];
        for (var k = 0; k < latLngArray.length; k+=incr) {
          newLatLngArray.push(latLngArray[k]);
        }
        latLngArray = newLatLngArray;
      }

      path = {
        path: latLngArray,
        samples: latLngArray.length/2
      };

    } else {
      path = {
        path: [leg.origin.getPosition(), leg.dest.getPosition()],
        samples: 150
      };
    }

    pathElevator.getElevationAlongPath(path, function(results, status) {
      if (status == google.maps.ElevationStatus.OK){
        leg.elevationProfile = results;
        elevationProfileFactory(legArray);
      } else {
        console.log('failed to get path elevation from google', status);
      }
    });  
  };
}]);
