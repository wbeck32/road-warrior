// this is factories.js

roadWarrior.factory('routeFactory', function(){

  var allRoutes = [];
  var currentRoute = new Route();
  allRoutes.push(currentRoute);

  function Route(){
    this.markers = [];
    this.addMarker = function(marker){
      this.markers.push(marker);
    };
    this.name = "route " + (allRoutes.length + 1);
  }
  
  return  {
    create : function(){
      var route = new Route();
      allRoutes.push(route);
      currentRoute = route;
    },

    getCurrent : function(){
      return currentRoute;
    },

    getLatestMarker : function(){
      return currentRoute.markers[currentRoute.markers.length - 1];
    },

    addMarker : function(marker){
      currentRoute.addMarker(marker);
    },

    getAll : function(){
      return allRoutes;
    },

    removeMarker : function(marker){
      var index = currentRoute.markers.indexOf(marker);
      currentRoute.markers.splice(index, 1);
    },	

    getNeighbors : function(marker){
      var index = currentRoute.markers.indexOf(marker);
      return [currentRoute.markers[index-1], currentRoute.markers[index+1]];
    },

    saveRoute : function() {
      allRoutes.push(currentRoute);
    },

    getSavedRoute : function() {
      return allRoutes;
    }
  };
});
