'use strict';

angular.module('f1App')
    .controller('MainCtrl', function ($scope, $http) {

        $scope.baseurl = 'http://ergast.com/api/f1/';

        $http({method: 'get', url: $scope.baseurl + 'current.json'}).success(function(data) {
            $scope.season = data.MRData.RaceTable;
          });

      });
