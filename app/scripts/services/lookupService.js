'use strict';

angular.module('f1App').factory('LookupService', ['$http', function($http) {
  var service = {};

  service.lookupData = null;
  service.isLoaded = false;
  service.isLoading = false;
  service.loadPromise = null;

  service.loadLookupData = function() {
    if (service.isLoaded) {
      return Promise.resolve(service.lookupData);
    }

    if (service.isLoading) {
      return service.loadPromise;
    }

    service.isLoading = true;
    service.loadPromise = $http.get('f1.json')
      .then(function(response) {
        service.lookupData = response.data;
        service.isLoaded = true;
        service.isLoading = false;
        return service.lookupData;
      })
      .catch(function(error) {
        console.error('Error loading lookup data:', error);
        service.isLoading = false;
        service.loadPromise = null;
        throw error;
      });

    return service.loadPromise;
  };

  service.getLookupData = function() {
    if (service.isLoaded) {
      return Promise.resolve(service.lookupData);
    } else {
      return service.loadLookupData();
    }
  };

  // Auto-load the lookup data when the service is instantiated
  service.loadLookupData();

  return service;
}]);
