// this is mapFactory.js

angular.module('roadWarrior').factory('mapFactory', ['mapStyles', function(mapStyles){

  var currentPosition = {lat: 45.5227, lng: -122.6731};
  var showChart = false;
  var mapOptions = {
    zoom: 16,
    draggableCursor: 'crosshair',
    center: currentPosition,
    styles: mapStyles,
    panControl: false,
    zoomControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER,
      style: google.maps.ZoomControlStyle.SMALL
    },
    streetViewControlOptions: {
      position: google.maps.ControlPosition.LEFT_CENTER
    }
  };
  
  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  google.maps.event.addListener(autocomplete, 'place_changed', function(){
    // infowindow.close();
    // marker.setVisible(false);
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    }
    else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
  });

  var locateMe = document.createElement('img');
  locateMe.src = "/images/locationIcon.svg";
  locateMe.style.cursor = "pointer";
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(locateMe);

  var elevation = document.createElement('img');
  elevation.src = "/images/elevation_icon.png";
  elevation.style.cursor = "pointer";
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(elevation);

  var elevationButton = document.getElementById('slider-button');

  google.maps.event.addDomListener(elevationButton, 'click', function(){
    var chart = document.getElementById('elevation-wrapper');
    if (showChart){
      chart.className = 'hideChart';
      elevationButton.style.backgroundColor='#00bfff';
    } else {
      chart.className = 'showChart';
      elevationButton.style.backgroundColor='#00ffff';
    }
    showChart = !showChart;
  });

  google.maps.event.addDomListener(elevation, 'click', function(){
    var chart = document.getElementById('elevation-wrapper');
    if (showChart){
      chart.className = "hideChart";
    } else {
      chart.className = "showChart";
    }
    showChart = !showChart;
  });


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

