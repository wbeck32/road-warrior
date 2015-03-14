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
  
  function getNeighbors (marker) {
    var currentLeg = trek[0];
    var prevLeg;
    var nextLeg;
    var counter = 0;
    while (!prevLeg || !nextLeg) {
      if(currentLeg.origin === marker) {
        nextLeg = currentLeg;
      } if (currentLeg.dest === marker) {
        prevLeg = currentLeg;
      } 
      counter++;
      currentLeg = trek[counter];

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
      if (trek.length > 0){
        var lastLeg = trek[trek.length - 1];
        var leg = new Leg(lastLeg.dest, dest);
        getDirections(leg);
        trek.push(leg);
      } else if (!trekOrigin){
        trekOrigin = dest;
      } else { 
        var leg = new Leg(trekOrigin, dest);
        getDirections(leg);
        trek.push(leg);
        trekOrigin = null;
      }
    },  

    removeMarker : function(marker){
      marker.setMap(null);
      if (trek.length === 0) {
        trekOrigin = null;
      } else if (trek.length === 1) {
        if(marker === trek[0].origin) {
          trekOrigin = trek[0].dest;
        } else {
          trekOrigin = trek[0].origin; 
        }
        trek.pop().rend.setMap(null);
      } else if (marker === trek[trek.length - 1].dest) {
        trek.pop().rend.setMap(null);
      } else if (marker === trek[0].origin) {
        trek.shift().rend.setMap(null);
      } else {
        var neighbors = getNeighbors(marker);
        neighbors.prevLeg.rend.setMap(null);
        neighbors.nextLeg.rend.setMap(null);
        var newLeg = new Leg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
        getDirections(newLeg);
        var prevIndex = trek.indexOf(neighbors.prevLeg);
        trek.splice(prevIndex, 2, newLeg);
      }
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