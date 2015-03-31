angular.module('roadWarrior').filter('totalDistance', function(){
  return function(input){
    return input.reduce(function(prev, leg, index, array){
      if (leg.rend.directions){
        return prev + leg.rend.directions.routes[0].legs[0].distance.value;
      } else return prev;
    }, 0);
  };
}).filter('metersToMiles', function(){
  return function(input){
    return (input * 0.0006214).toFixed(2);
  };
}).filter('metersToFeet', function(){
  return function(input){
    return (input * 3.281).toFixed(0);
  };
});
