'use strict';

angular
  .module('f1App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'f1Filters'
  ])
  .config(function ($routeProvider, $locationProvider) {
    // Fix for AngularJS 1.6+ URL encoding issues
    $locationProvider.hashPrefix('');

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/results/:circuitId', {
        templateUrl: 'views/results.html',
        controller: 'ResultsCtrl'
      })
      .when('/quali/:circuitId', {
        templateUrl: 'views/quali.html',
        controller: 'QualiCtrl'
      })
      .when('/sprint/:circuitId', {
        templateUrl: 'views/sprint.html',
        controller: 'SprintCtrl'
      })
      .when('/drivers', {
        templateUrl: 'views/drivers.html',
        controller: 'DriverCtrl'
      })
      .when('/drivers/:season/:round', {
        templateUrl: 'views/drivers.html',
        controller: 'DriverCtrl'
      })
      .when('/constructors', {
        templateUrl: 'views/constructors.html',
        controller: 'ConstructorCtrl'
      })
      .when('/constructors/:season/:round', {
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
