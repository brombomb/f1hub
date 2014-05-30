'use strict';

angular
  .module('f1App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'f1Filters'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/results/:circuitId', {
        templateUrl: 'views/results.html',
        controller: 'ResultsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
