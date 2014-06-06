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
      .when('/results/:circuitId/rd/:round', {
        templateUrl: 'views/results.html',
        controller: 'ResultsCtrl'
      })
      .when('/drivers', {
        templateUrl: 'views/drivers.html',
        controller: 'DriverCtrl'
      })
      .when('/constructors', {
        templateUrl: 'views/constructors.html',
        controller: 'ConstructorCtrl'
      })
      .when('/info', {
        templateUrl: 'views/info.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
