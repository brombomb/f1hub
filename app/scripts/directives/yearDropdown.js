'use strict';

angular.module('f1App')
  .directive('yearDropdown', ['YearService', '$rootScope', function(YearService, $rootScope) {
    return {
      restrict: 'E', // Element
      template: '<select class="form-control form-control-sm" ng-model="currentYear" ng-options="s.season as s.season for s in availableSeasons"></select>',
      link: function(scope, element, attrs) {
        scope.availableSeasons = YearService.getAvailableSeasons();
        scope.currentYear = YearService.getSelectedYear();

        // Watch for changes in the dropdown selection
        scope.$watch('currentYear', function(newYear, oldYear) {
          if (newYear !== oldYear && newYear) {
            YearService.setSelectedYear(newYear);
          }
        });

        // Listen for seasons updated event
        var seasonsUpdatedListener = $rootScope.$on('seasonsUpdated', function() {
          scope.availableSeasons = YearService.getAvailableSeasons();
          // Ensure currentYear is updated, especially on initial load after fetch
          var selectedYearFromService = YearService.getSelectedYear();
          if (scope.currentYear !== selectedYearFromService) {
            scope.currentYear = selectedYearFromService;
          }
        });

        // Listen for selected year changed event (e.g., by another component)
        var selectedYearChangedListener = $rootScope.$on('selectedYearChanged', function(event, newYear) {
          if (scope.currentYear !== newYear) {
            scope.currentYear = newYear;
          }
        });

        // Clean up listeners when the scope is destroyed
        scope.$on('$destroy', function() {
          seasonsUpdatedListener();
          selectedYearChangedListener();
        });
      }
    };
  }]);
