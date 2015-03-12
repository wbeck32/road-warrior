
var module = angular.module('roadWarrior.services', [])



// this is factories.js

roadWarrior.factory('routeFactory', function(){

  var allRoutes = [];
  var currentRoute = 0;

  initialize();

  function Route(){
    this.markers = [];
    this.addMarker = function(marker){
      this.markers.push(marker);
    };
    this.name = "route " + (allRoutes.length + 1);
  }
  
  function initialize(){
    allRoutes.push(new Route());
  }
  

  return  {
    create : function(){
      var route = new Route();
      allRoutes.push(route);
      currentRoute = allRoutes.length - 1;
    },

    getCurrent : function(){
      return allRoutes[currentRoute];
    },

    setCurrent : function(index){
      currentRoute = index;
    },

    addMarker : function(marker){
      allRoutes[currentRoute].addMarker(marker);
    },

    getAll : function(){
      return allRoutes;
    },

    removeMarker : function(marker){
      var index = allRoutes[currentRoute].markers.indexOf(marker);
      allRoutes[currentRoute].markers.splice(index, 1);	

    saveRoute = function() {
      allRoutes.push(currentRoute);
    }

    getSavedRoute = function() {
      return allRoutes;
    }
    }
  };

});

