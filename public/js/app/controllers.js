// this is controllers.js

// Trek Controller

angular.module('roadWarrior').controller('TrekController',
					 ['legFactory', 
					  'neighborsService', 
					  'mapFactory', 
					  'legArrayFactory',
  function(legFactory, neighborsService, mapFactory, legArrayFactory){
    this.legs = legArrayFactory;
    this.showEdit = []; 
    this.showDetails = [];
    this.value = "test";
    var trekOrigin = null;
    var markerIndex = 65;
    var self = this;

    this.update = function(){
      for (var i = 0; i < this.legs.length; i++){
	this.showEdit[i] = false;
	this.showDetails[i] = false;
	this.legs = legArrayFactory;
      }
    };

    google.maps.event.addListener(mapFactory, 'click', function(event) {
      self.addMarker(event.latLng);
      self.update();
    });

    this.addLeg = function(dest){
      dest.name = String.fromCharCode(markerIndex);
      markerIndex++;
      var leg;
      if (legArrayFactory.length > 0){
	var lastLeg = legArrayFactory[legArrayFactory.length - 1];
	leg = legFactory.create(lastLeg.dest, dest);
	legArrayFactory.push(leg);
      } else if (!trekOrigin){
	trekOrigin = dest;
      } else { 
	leg = legFactory.create(trekOrigin, dest);
	legArrayFactory.push(leg);
      }
    };  

    this.addMarker = function(latLng) {
      var marker = new google.maps.Marker({
	position: latLng,
	map: mapFactory,
	draggable: true
      });
      mapFactory.panTo(latLng);

      google.maps.event.addListener(marker, 'click', function(event){
	self.removeMarker(marker);
      });

      google.maps.event.addListener(marker, 'dragend', function(event){
	self.moveMarker(marker);
      });

      this.addLeg(marker);
    };

    this.moveMarker = function(marker){
      var neighbors = neighborsService(marker, legArrayFactory);
      if(neighbors.prevLeg) neighbors.prevLeg.getDirections();
      if(neighbors.nextLeg) neighbors.nextLeg.getDirections();
    };

    this.removeMarker = function(marker){
      marker.setMap(null);
      var neighbors = neighborsService(marker, legArrayFactory);
      if (!neighbors.prevLeg && !neighbors.nextLeg) {
	trekOrigin = null;
      } else if (!neighbors.prevLeg && neighbors.nextLeg) {
	trekOrigin = neighbors.nextLeg.dest;
	legArrayFactory.shift().rend.setMap(null);

      } else if (neighbors.prevLeg && !neighbors.nextLeg) {
	legArrayFactory.pop().rend.setMap(null);
      } else {
	neighbors.prevLeg.rend.setMap(null);
	neighbors.nextLeg.rend.setMap(null);
	var newLeg = legFactory.create(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
	var prevIndex = legArrayFactory.indexOf(neighbors.prevLeg);
	legArrayFactory.splice(prevIndex, 2, newLeg);
      }
    };
    
    this.removeLeg = function(index) {
      if(legArrayFactory.length === 1) {
	legArrayFactory[0].origin.setMap(null);
	this.removeMarker(legArrayFactory[0].dest);
	trekOrigin = null;
      } else if (index === 0){
	this.removeMarker(legArrayFactory[0].origin);
      } else {
	this.removeMarker(legArrayFactory[index].dest);
      }          
    };

    this.toggleEdit = function(index){
      this.showEdit[index] = !this.showEdit[index];
    };
    this.toggleDetails = function(index){
      this.showDetails[index] = !this.showDetails[index];
    };
  }]);

/*
// Map Controller

roadWarrior.controller('MapCtrl', function(mapFactory, trekFactory){

  var elevator = new google.maps.ElevationService();  
  
 // getLocation();

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function locationAllowed(position) {
          mapFactory.panTo(position);
      });
    } 
  }


  function getElevation(latLng, marker) {

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
  }
});

*/
