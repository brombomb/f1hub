'use strict';

angular.module('f1App').factory('YearService', ['$http', '$rootScope', function($http, $rootScope) {
  var service = {};

  service.availableSeasons = [];
  service.selectedYear = new Date().getFullYear(); // Default to current year

  service.fetchSeasons = function() {
    $http.get('https://api.jolpi.ca/ergast/f1/seasons.json?limit=100')
      .then(function(response) {
        service.availableSeasons = response.data.MRData.SeasonTable.Seasons;
        if (service.availableSeasons && service.availableSeasons.length > 0) {
          // Sort seasons descending to get the latest first
          service.availableSeasons.sort(function(a, b) {
            return parseInt(b.season) - parseInt(a.season);
          });
          service.selectedYear = service.availableSeasons[0].season;
        }
        $rootScope.$broadcast('seasonsUpdated');
      })
      .catch(function(error) {
        console.error('Error fetching seasons:', error);
        // Optionally broadcast an error event
        $rootScope.$broadcast('seasonsUpdateFailed');
      });
  };

  service.getAvailableSeasons = function() {
    return service.availableSeasons;
  };

  service.getSelectedYear = function() {
    return service.selectedYear;
  };

  service.setSelectedYear = function(year) {
    service.selectedYear = year;
    $rootScope.$broadcast('selectedYearChanged', year);
  };

  // Call fetchSeasons when the service is instantiated
  service.fetchSeasons();

  return service;
}]);
