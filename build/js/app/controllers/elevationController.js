// this is elevationController.js

angular.module('roadWarrior').controller('ElevationController', function(){

  this.show = "elevation-chart-wrapper hideElevation";
  this.toggle = function() {
    if (this.show === "elevation-chart-wrapper"){
      this.show = "elevation-chart-wrapper hideElevation";
    } else this.show = "elevation-chart-wrapper";
  };

});
