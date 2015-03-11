// this is routeCtrl.js

angular.module('roadWarrior').factory('Route', function(){
  var routes = [new Route()];
  var currentRoute = 0;

  function Route(){
    this.markers = [];
    this.addMarker = function(marker){
      this.markers.push(marker);
    };
  }

  return {
    create : function(){
      var route = new Route();
      routes.push(route);
      currentRoute = routes.length - 1;
    },

    getCurrentRoute : function(){
      return routes[currentRoute];
    },

    setCurrentRoute : function(index){
      currentRoute = index;
    },

    addMarker : function(marker){
      routes[currentRoute].addMarker(marker);
    }
  };

}).controller('RouteCtrl', ['Route', function(Route){
  var markers = Route.getCurrentRoute().markers;
}]);
