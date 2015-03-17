// this is controllers.js

// Trek Controller

roadWarrior.controller('TrekCtrl', function(trekService, mapFactory, $window){
  this.legs = trekService.trek;
  this.showEdit = []; 
  this.showDetails = [];
  var self = this;

  this.removeLeg = function(index) {
    if(this.legs.length === 1) {
      this.legs[0].origin.setMap(null);
      trekService.removeMarker(this.legs[0].dest);
      trekService.resetOrigin();
    } else if (index === 0){
      trekService.removeMarker(this.legs[0].origin);
    } else {
      trekService.removeMarker(this.legs[index].dest);
    }          
  };

  this.toggleEdit = function(index){
    this.showEdit[index] = !this.showEdit[index];
  };
  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };

  this.update = function() {  
    $window.setTimeout(function(){
      self.legs = trekService.trek;
      for(var i = 0;i < self.legs.length; i++) {
	self.showEdit[i] = false;
	self.showDetails[i] = false;
      }
    }, 2000);
  };
  google.maps.event.addListener(mapFactory, 'center_changed', function(event) {
    self.update();
  });

});


// Map Controller

roadWarrior.controller('MapCtrl', function(mapFactory, trekService){

  var elevator = new google.maps.ElevationService();  
  
 // getLocation();

  google.maps.event.addListener(mapFactory, 'click', function(event) {
    var newMarker = trekService.createMarker(event.latLng);
    mapFactory.panTo(event.latLng);
    getElevation(event.latLng, newMarker);
    trekService.addLeg(newMarker);
  });

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function locationAllowed(position) {
          mapFactory.panTo(position);
      });
    } 
  }

  function addMarker(latLng) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: mapFactory,
      draggable: true
    });
    mapFactory.panTo(latLng);

    google.maps.event.addListener(marker, 'click', function(event){
      trekService.removeMarker(marker);
    });

    google.maps.event.addListener(marker, 'dragend', function(event){
      trekService.moveMarker(marker);
    });
  };

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

