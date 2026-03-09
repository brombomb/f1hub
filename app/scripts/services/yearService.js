'use strict';

angular.module('f1App').factory('YearService', ['$http', '$rootScope', function($http, $rootScope) {
  var service = {};

  service.availableSeasons = [];
  service.selectedYear = new Date().getFullYear(); // Default to current year
  service.seasonDataCache = {}; // Cache for season race data
  service.baseurl = 'https://api.jolpi.ca/ergast/f1/';

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
    var oldYear = service.selectedYear;
    service.selectedYear = year;
    if (oldYear !== year) {
      $rootScope.$broadcast('selectedYearChanged', year);
    }
  };

  // Get season data with caching
  service.getSeasonData = function(year) {
    year = year || service.selectedYear;

    if (service.seasonDataCache[year]) {
      return Promise.resolve(service.seasonDataCache[year]);
    }

    return $http.get(service.baseurl + year + '/')
      .then(function(response) {
        service.seasonDataCache[year] = response.data.MRData.RaceTable;
        return service.seasonDataCache[year];
      })
      .catch(function(error) {
        console.error('Error fetching season data for', year, ':', error);
        return null;
      });
  };

  // Get race navigation data for a specific circuit
  service.getRaceNavigation = function(circuitId, year) {
    return service.getSeasonData(year).then(function(seasonData) {
      if (!seasonData || !seasonData.Races) {
        return { previousRace: null, nextRace: null };
      }

      var currentIndex = -1;
      for (var i = 0; i < seasonData.Races.length; i++) {
        if (seasonData.Races[i].Circuit.circuitId === circuitId) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex === -1) {
        return { previousRace: null, nextRace: null };
      }

      return {
        previousRace: currentIndex > 0 ? seasonData.Races[currentIndex - 1] : null,
        nextRace: currentIndex < seasonData.Races.length - 1 ? seasonData.Races[currentIndex + 1] : null
      };
    });
  };

  // Call fetchSeasons when the service is instantiated
  service.fetchSeasons();

  return service;
}]);
