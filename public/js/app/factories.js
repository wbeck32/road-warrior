  // this is factories.js

angular.module('roadWarrior').service('legService', ['$rootScope', 'mapFactory', 'markerFactory', 'neighborsService', 'pathElevationService', 'elevationProfileFactory', function($rootScope, mapFactory, markerFactory, neighborsService, pathElevationService, elevationProfileFactory){
  
  this.legs = [];
  this.name = "new trek";
  var trekOrigin = null;
  var renderOptions = {suppressMarkers: true, preserveViewport: true, draggable: true};
  var directionsService = new google.maps.DirectionsService();

  var self = this;

  this.unRenderAll = function(){
    markerFactory.markerIndex = 65;
    if (trekOrigin) {
      trekOrigin.setMap(null);
    }
    trekOrigin = null;
    this.name = "new trek";
    if (this.legs.length > 0){
      this.legs.forEach(function(leg){
      leg.dest.setMap(null);
      leg.rend.setMap(null);
    });
      this.legs = [];
    }
  };

  this.renderAll = function(){
    markerFactory.markerIndex = 66 + this.legs.length;
    trekOrigin = this.legs[0].origin;
    this.legs[0].origin.setMap(mapFactory);
    this.legs.forEach(function(leg){
      leg.dest.setMap(mapFactory);
      leg.rend.setMap(mapFactory);
    });
    elevationProfileFactory(this.legs);
  };

  this.createLeg = function(org, des){
    
    function Leg(origin, dest){
      this.origin = origin;
      this.dest = dest;
      this.rend = new google.maps.DirectionsRenderer(renderOptions);
      this.rend.setMap(mapFactory);
      this.elevationProfile = [];
      this.travelMode = "WALKING";

      var thisLeg = this;
      google.maps.event.addListener(thisLeg.rend, 'directions_changed', function(){
      	$rootScope.$apply(function(){ 
      	  if (thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.length > 0){
      	    var newMarker = markerFactory.create(thisLeg.rend.getDirections().routes[0].legs[0].via_waypoints.pop(), self);
      	    var newLeg = self.createLeg(newMarker, thisLeg.dest);
	    newLeg.travelMode = thisLeg.travelMode;
      	    self.legs.splice(self.legs.indexOf(thisLeg) + 1, 0, newLeg);
      	    thisLeg.dest = newMarker;
      	    thisLeg.getDirections();
      	  }
      	});
      });
      
      this.getDirections = function(){
      	var request = {
      	  origin: this.origin.getPosition(),
      	  destination: this.dest.getPosition(),
      	  travelMode: this.travelMode
      	};
      	directionsService.route(request, function(response, status) {
      	  if (status == google.maps.DirectionsStatus.OK) {
              thisLeg.rend.setDirections(response);
              pathElevationService(thisLeg, self.legs);
      	  }
      	});
      };
      this.getDirections();
    }

    return new Leg(org, des);
  };

  this.addLeg = function(dest){
    var leg;
    if (this.legs.length > 0){
      var lastLeg = this.legs[this.legs.length - 1];
      leg = this.createLeg(lastLeg.dest, dest);
    } else if (!trekOrigin){
      trekOrigin = dest;
    } else { 
      leg = this.createLeg(trekOrigin, dest);
    }
    if (leg){
      this.legs.push(leg);
      elevationProfileFactory(this.legs);
    }
    
  };  

  google.maps.event.addListener(mapFactory, 'click', function(event) {
    var newMarker = markerFactory.create(event.latLng, self);
    self.addLeg(newMarker);
  });

  this.moveMarker = function(marker){
    var neighbors = neighborsService(marker, this.legs);
    if(neighbors.prevLeg) neighbors.prevLeg.getDirections();
    if(neighbors.nextLeg) neighbors.nextLeg.getDirections();
  };

  this.removeMarker = function(marker){
    marker.setMap(null);
    var neighbors = neighborsService(marker, this.legs);
    if (!neighbors.prevLeg && !neighbors.nextLeg) {
      trekOrigin = null;
      markerFactory.markerIndex = 65;
    } else if (!neighbors.prevLeg && neighbors.nextLeg) {
      trekOrigin = neighbors.nextLeg.dest;
      trekOrigin.setIcon("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + trekOrigin.index + "|009900|000000");
      this.legs.shift().rend.setMap(null);

    } else if (neighbors.prevLeg && !neighbors.nextLeg) {
      this.legs.pop().rend.setMap(null);
    } else {
      neighbors.prevLeg.rend.setMap(null);
      neighbors.nextLeg.rend.setMap(null);
      var newLeg = this.createLeg(neighbors.prevLeg.origin, neighbors.nextLeg.dest);
      var prevIndex = this.legs.indexOf(neighbors.prevLeg);
      this.legs.splice(prevIndex, 2, newLeg);
    }
    elevationProfileFactory(this.legs);
  };
  
  this.removeLeg = function(index) {
    if(this.legs.length === 1) {
      this.legs[0].origin.setMap(null);
      this.removeMarker(this.legs[0].dest);
      trekOrigin = null;
      markerFactory.markerIndex = 65;
    } else if (index === 0){
      this.removeMarker(this.legs[0].origin);
    } else {
      this.removeMarker(this.legs[index].dest);
    }     
  };

}]);

angular.module('roadWarrior').factory('markerFactory', ['$rootScope', 'mapFactory', 'elevationService', function($rootScope, mapFactory, elevationService){
 

  return {
    
    markerIndex : 65,

    markerColor : function(){
      if (this.markerIndex === 65){
	return "|009900|000000";
      } else return "|ff0000|000000";
    },

    create : function(latLng, thisObj) {
      var marker = new google.maps.Marker({
      	position: latLng,
      	map: mapFactory,
      	draggable: true,
	icon: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + String.fromCharCode(this.markerIndex) + this.markerColor()
      });

      elevationService(latLng, marker);
      marker.index = String.fromCharCode(this.markerIndex);
      this.markerIndex++;

      mapFactory.panTo(latLng);

      google.maps.event.addListener(marker, 'click', function(event){
      	$rootScope.$apply(function(){
      	  thisObj.removeMarker(marker);
      	});
      });

      google.maps.event.addListener(marker, 'dragend', function(event){
      	$rootScope.$apply(function(){
      	  thisObj.moveMarker(marker);
      	});
      });
      return marker;
    }
  }; 

}]);

angular.module('roadWarrior').factory('mapFactory', ['mapStyles', function(mapStyles){

  var currentPosition = {lat: 45.5227, lng: -122.6731};

  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: currentPosition,
    styles: mapStyles
  };
  
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var locateMe = document.createElement('img');
  locateMe.style.margin = "-3px";
  locateMe.src = "http://maps.google.com/mapfiles/kml/pal4/icon57.png";
  locateMe.style.cursor = "pointer";
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locateMe);

  google.maps.event.addDomListener(locateMe, 'click', function(){
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
    	function locationAllowed(position) {
    	  map.panTo({lat: position.coords.latitude, lng: position.coords.longitude});
    	});
    } 
  });
  
  return map;

}]);

angular.module('roadWarrior').factory('pathElevationService', ['mapFactory', 'elevationProfileFactory', function(mapFactory, elevationProfileFactory){
  
  var pathElevator = new google.maps.ElevationService();  

  return function(leg, legArray) {

    var steps = leg.rend.getDirections().routes[0].legs[0].steps;
    
    var latLngArray = [];

    for (var i = 0; i < steps.length; i++) {
      for (var j = 0; j < steps[i].path.length; j++) {
        latLngArray.push(steps[i].path[j]);
      }
    }
    
    if(latLngArray.length > 200) {
      var incr = Math.ceil(latLngArray.length/200);
      var newLatLngArray = [];
      for (var i = 0; i < latLngArray.length; i+=incr) {
        newLatLngArray.push(latLngArray[i]);
      }
      latLngArray = newLatLngArray;
    }

    var path = {
      path: latLngArray,
      samples: latLngArray.length/2
    };

    pathElevator.getElevationAlongPath(path, function(results, status) {
      if (status == google.maps.ElevationStatus.OK){
        leg.elevationProfile = results;
        elevationProfileFactory(legArray);
      } else {
        console.log('You suck, sucker', status);
      }
    });  
  };
}]);

angular.module('roadWarrior').factory('elevationProfileFactory', ['mapFactory', function(mapFactory){
  return function (legArray) {
    

    chart = new google.visualization.AreaChart(document.getElementById('elevation-chart'));
    google.visualization.events.addListener(chart, 'onmouseover', chartEvent)
    var data = new google.visualization.DataTable();

    function chartEvent (point) {
      google.visualization.events.addListener(chart, 'onmouseout', removeMarker)
      var latLng = JSON.parse(data.getValue(point.row, 1));
      mapFactory.panTo({lat: latLng.k, lng: latLng.D}); 
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(latLng.k, latLng.D),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10
        },
        map: mapFactory
      });
      function removeMarker () {
        marker.setVisible(false);
      }


    }
    
    data.addColumn('number', 'Elevation');
    data.addColumn('string', 'Location');
    for (var i = 0; i < legArray.length; i++) {
      for (var j = 0; j < legArray[i].elevationProfile.length; j++) {
        data.addRow([legArray[i].elevationProfile[j].elevation, JSON.stringify(legArray[i].elevationProfile[j].location)]);
      }
    };
    

    document.getElementById('elevation-chart').style.display = 'block';
    chart.draw(data, { legend: 'none', forceIFrame: false, chartArea: {width: '100%', height: '98%'} });
  };
}]);

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
