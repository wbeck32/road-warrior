// this is app.js - main client side angular file

var roadWarrior = angular.module('roadWarrior', ['ngCookies']);
roadWarrior.config(['$compileProvider', function ($compileProvider) {
  $compileProvider.debugInfoEnabled(false);
}]);
