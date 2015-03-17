// this is factories.js

angular.module('roadWarrior').factory('legFactory', ['mapFactory', function(mapFactory){

  var renderOptions = {suppressMarkers: true, preserveViewport: true, draggable: true};
  var directionsService = new google.maps.DirectionsService();
  var markerIndex = 65;
  
  function Leg(origin, dest){
    this.origin = origin;
    this.dest = dest;
    this.rend = new google.maps.DirectionsRenderer(renderOptions);
    this.rend.setMap(mapFactory);
    var thisLeg = this;
    this.getDirections = function(){
      var request = {
	origin: this.origin.getPosition(),
	destination: this.dest.getPosition(),
	travelMode: google.maps.TravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
	if (status == google.maps.DirectionsStatus.OK) {
          thisLeg.rend.setDirections(response);
	}
      });
    };
    this.getDirections();
  }
      
  return {
    create : function(origin, dest){
      return new Leg(origin, dest);
    }
  };
}]);

roadWarrior.factory('mapFactory', ['mapStyles', function(mapStyles){

  this.currentPosition = {lat: 45.5227, lng: -122.6731};

  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: this.currentPosition,
    styles: mapStyles
  };

  return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

}]);
