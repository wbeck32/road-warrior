// this is elevationService.js

angular.module('roadWarrior').factory('elevationService', function(){

  var elevator = new google.maps.ElevationService();  

  return function(latLng, marker) {

    var position = {
      'locations': [latLng]
    };

    elevator.getElevationForLocations(position, function(results, status) {
      if (status == google.maps.ElevationStatus.OK){
        if (results[0]){
          marker.elevation = results[0].elevation;
        } else {
          marker.elevation = null;
        }
      } else {
        marker.elevation = null;
      }
    });  
  };
});
