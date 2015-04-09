// this is distanceService.js

angular.module('roadWarrior').factory('distanceService', function(){

  var calculator = google.maps.geometry.spherical;

  return function (latLng1, latLng2){

    return calculator.computeDistanceBetween(latLng1, latLng2);

  };

});
