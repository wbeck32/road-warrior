// this file contains the styles for the google maps object

angular.module('roadWarrior').value('mapStyles', 
  [
    {
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [
        { "visibility": "on" }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
        { "hue": "#f0e6d5" },
        { "ligtness": 10 }
      ]
    },
    {
      "featureType": "landscape.natural.terrain",
      "stylers": [
        { "hue": "#808080" },
        { "lightness": 10 }
      ]
    },
    {
      "featureType": "landscape.natural.landcover",
      "stylers": [
        { "hue": "#606060" },
        { "lightness": 10 }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#ffefd5"
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
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#b0b1b1"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#d5d6d6"
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
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#acbcc9"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        { 
          "color": "#ffffff"
        }
      ]
    },
    { 
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [
        { 
          "color": "#555555"
        }
      ]
    }
  ]
);
