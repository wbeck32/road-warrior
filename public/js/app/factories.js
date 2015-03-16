// this is factories.js

roadWarrior.factory('trekFactory', function(mapFactory){

  var renderOptions = {suppressMarkers: true, preserveViewport: true};
  var directionsService = new google.maps.DirectionsService();
  var trek = [];
  var markerIndex = 65;
  var trekOrigin = null;

  function Leg(origin, dest){
    this.origin = origin;
    this.dest = dest;
    this.rend = new google.maps.DirectionsRenderer(renderOptions);
    this.rend.setMap(mapFactory);
  }

  function getDirections(leg){

    if (leg) {
      var request = {
	origin: leg.origin.getPosition(),
	destination: leg.dest.getPosition(),
	travelMode: google.maps.TravelMode.WALKING
      };
      directionsService.route(request, function(response, status) {
	if (status == google.maps.DirectionsStatus.OK) {
          leg.rend.setDirections(response);
	}
      });
    }
  }
  
  function getNeighbors (marker) {
    var currentLeg = trek[0];
    var prevLeg;
    var nextLeg;
    var counter = 0;
    if (trek.length > 0) {
      while (!prevLeg || !nextLeg) {
	if(currentLeg.origin === marker) {
          nextLeg = currentLeg;
	} if (currentLeg.dest === marker) {
          prevLeg = currentLeg;
	} 
	counter++;
	if(counter > trek.length -1) break;
	currentLeg = trek[counter];

      }
    }
    return {prevLeg: prevLeg, nextLeg: nextLeg};
  };

  return  {

    getTrek : function() {
      return trek;
    },

    resetOrigin : function() {
      trekOrigin = null;
    },

    addLeg : function(dest){
      dest.name = String.fromCharCode(markerIndex);
      markerIndex++;
      var leg;
      if (trek.length > 0){
        var lastLeg = trek[trek.length - 1];
        leg = new Leg(lastLeg.dest, dest);
        getDirections(leg);
        trek.push(leg);
      } else if (!trekOrigin){
        trekOrigin = dest;
      } else { 
        leg = new Leg(trekOrigin, dest);
        getDirections(leg);
        trek.push(leg);
      }
    },  

    removeMarker : function(marker){
      marker.setMap(null);
      var neighbors = getNeighbors(marker);
      if (!neighbors.prevLeg && !neighbors.nextLeg) {
        this.resetOrigin();
      } else if (!neighbors.prevLeg && neighbors.nextLeg) {
        trekOrigin = neighbors.nextLeg.dest;
	trek.shift().rend.setMap(null);

      } else if (neighbors.prevLeg && !neighbors.nextLeg) {
        trek.pop().rend.setMap(null);
      } else {
        neighbors.prevLeg.rend.setMap(null);
        neighbors.nextLeg.rend.setMap(null);
        var newLeg = new Leg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
        getDirections(newLeg);
        var prevIndex = trek.indexOf(neighbors.prevLeg);
        trek.splice(prevIndex, 2, newLeg);
      }
    },

    moveMarker : function (marker){
      var neighbors = getNeighbors(marker);
      getDirections(neighbors.prevLeg);
      getDirections(neighbors.nextLeg);
    }
  };
});

roadWarrior.factory('mapFactory', function(mapStyles){

  this.currentPosition = {lat: 45.5227, lng: -122.6731};

  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: this.currentPosition,
    styles: mapStyles
  };

  return new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

});
