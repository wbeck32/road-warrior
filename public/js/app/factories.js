// this is factories.js

roadWarrior.factory('trekFactory', function(mapFactory){

  var renderOptions = {suppressMarkers: true, preserveViewport: true};
  var directionsService = new google.maps.DirectionsService();
  var trek = {
    first: null,
    last: null,
    length: 0
  }

  var firstMarker = null;

  function Leg(origin, dest){
    this.origin = origin;
    this.dest = dest;
    this.rend = new google.maps.DirectionsRenderer(renderOptions);
    this.rend.setMap(mapFactory);
    this.prev = null;
    this.next = null;
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
    var currentLeg = trek.last;
    var prevLeg;
    var nextLeg;
    while (!prevLeg || !nextLeg) {
      if(currentLeg.origin === marker) {
        nextLeg = currentLeg;
      } if (currentLeg.dest === marker) {
        prevLeg = currentLeg;
      } 
      currentLeg = currentLeg.prev;
    }
    return {prevLeg: prevLeg, nextLeg: nextLeg};

  };

  return  {
    addLeg : function(dest){
      if (trek.last){
        var leg = new Leg(trek.last.dest, dest);
        getDirections(leg);
        leg.prev = trek.last;
        trek.last.next = leg;
        trek.last = leg;
      } else if (!firstMarker){
        firstMarker = dest;
      } else { 
        var leg = new Leg(firstMarker, dest);
        trek.first = leg;
        trek.last = leg;
        getDirections(leg);
        firstMarker = null;
      }
    },  

    removeMarker : function(marker){
      var neighbors = getNeighbors(marker);
      console.log(neighbors);
      neighbors.prevLeg.rend.setMap(null);
      neighbors.nextLeg.rend.setMap(null);
      marker.setMap(null);
      var newLeg = new Leg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
      getDirections(newLeg);
      neighbors.prevLeg.prev.next = newLeg;
      neighbors.nextLeg.next.prev = newLeg;
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