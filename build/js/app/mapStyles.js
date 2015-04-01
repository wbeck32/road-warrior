// this file contains the styles for the google maps object

angular.module('roadWarrior').value('mapStyles', 
  [
    {
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
        {
          "color": "#ffebcd"
        },
        {
          "lightness": 20 
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffe4c4"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
        {
          "lightness": 5
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c5c6c6"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e4d7c6"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#fbfaf7"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "color": "#f0f8ff"
        }
      ]
    }
  ]
);
