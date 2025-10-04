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

// Show loader until the first view finishes rendering, then hide it.
angular.module('f1App').run(function($rootScope, $timeout) {
  var loader = document.getElementById('app-loader');

  function hideLoader() {
    if (!loader) return;
    // Allow a small delay so users see the spinner on very fast loads
    $timeout(function() {
      loader.setAttribute('aria-hidden', 'true');
      // mark scope as hydrated after a short delay so the transition runs
      $timeout(function() {
        try {
          var scopeEl = document.getElementById('scope');
          if (scopeEl) scopeEl.classList.add('hydrated');
        } catch (e) {}
      }, 20);
    }, 80);
  }

  function showLoader() {
    if (!loader) return;
    loader.setAttribute('aria-hidden', 'false');
  }

  // Show when navigation starts and hide when content is ready
  $rootScope.$on('$routeChangeStart', function() {
    // remove hydrated state immediately when navigation begins
    try { var s = document.getElementById('scope'); if (s) s.classList.remove('hydrated'); } catch (e) {}
    showLoader();
  });
  $rootScope.$on('$viewContentLoaded', hideLoader);
  $rootScope.$on('$routeChangeSuccess', hideLoader);

  // Defensive: hide after a max timeout in case of errors
  $timeout(hideLoader, 5000);
});
