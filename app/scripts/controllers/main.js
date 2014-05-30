'use strict';

angular.module('f1App', ['f1Filters'])
    .controller('MainCtrl', function ($scope, $http) {

        $scope.today = new Date();
        $scope.baseurl = 'http://ergast.com/api/f1/';

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: $scope.baseurl + 'current.json'}).success(function(data) {
            $scope.season = data.MRData.RaceTable;
            for(var i in $scope.season.Races) {
                if($scope.season.Races.hasOwnProperty(i)) {
                    var race = $scope.season.Races[i];
                    if(race.date !== undefined) {
                        $scope.season.Races[i]['results'] = Date.parse(race.date) < $scope.today;
                        $scope.season.Races[i]['dt'] = race.date + 'T' + race.time;
                    }
                }
            }
          });

      })

    .controller('ResultsCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'http://ergast.com/api/f1/';
        $scope.sort = 'position'

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/results.json'}).success(function(data) {
            $scope.results = data.MRData.RaceTable.Races[0];
          });
      });
    
angular.module('f1Filters')
    .filter('helmet', function() {
        return function(driver) {
            return $scope.lookup.url + $scope.lookup.helmet.replace('{driver_id}', $scope.lookup.ids.drivers[driver]);
        };
      });
