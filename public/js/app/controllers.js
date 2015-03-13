// this is controllers.js

// Trek Controller

roadWarrior.controller('TrekCtrl', function(trekFactory){
  this.legs = trekFactory.getTrek();
  this.toggleEdit = function(index){
    this.showEdit[index] = !this.showEdit[index];
  };
  this.toggleDetails = function(index){
    this.showDetails[index] = !this.showDetails[index];
  };
  this.update = function() {  
    this.legs = trekFactory.getTrek();
    console.log(this.legs);
  };
});


// Map Controller

roadWarrior.controller('MapCtrl', function(mapFactory, trekFactory){

  var elevator = new google.maps.ElevationService();  
  
 // getLocation();

  google.maps.event.addListener(mapFactory, 'click', function(event) {
    addMarker(event.latLng);
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
      map: mapFactory
    });
    mapFactory.panTo(latLng);

    google.maps.event.addListener(marker, 'click', function(event){
      trekFactory.removeMarker(marker);
    });

    getElevation(latLng, marker);

    trekFactory.addLeg(marker);
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

