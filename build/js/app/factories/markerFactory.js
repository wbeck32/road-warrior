// this is markerFactory.js

angular.module('roadWarrior').factory('markerFactory', ['$rootScope', 'mapFactory', 'elevationService', function($rootScope, mapFactory, elevationService){
  

  return {
    
    markerIndex : 0,

    resetIndex : function() {
      this.markerIndex = 0;
    },

    markerColor : function(){
      if (this.markerIndex === 0){
	       return "|8fbc8f|000000";
      } else return "|ff4500|000000";
    },

    asciiIndex : function(){
      if (this.markerIndex > 25) {
	      return String.fromCharCode(this.markerIndex + 71);
      } else return String.fromCharCode(this.markerIndex + 65);
    },

    create : function(latLng, thisObj, dontRenderNow) {

      var marker = new google.maps.Marker({
      	position: latLng,
      	map: dontRenderNow ? null : mapFactory,
      	draggable: true,
        icon: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + this.asciiIndex() + this.markerColor()
      });


      marker.index = this.asciiIndex();
      this.markerIndex++;
      
      if (!dontRenderNow) {
        mapFactory.panTo(latLng);
      }
      
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

