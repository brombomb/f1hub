'use strict';

angular.module('f1App')
    .controller('MainCtrl', function ($scope, $http) {

        $scope.today = new Date();
        $scope.baseurl = 'https://ergast.com/api/f1/';

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: $scope.baseurl + 'current.json'}).success(function(data) {
            $scope.season = data.MRData.RaceTable;
            for(var i in $scope.season.Races) {
                if($scope.season.Races.hasOwnProperty(i)) {
                    var race = $scope.season.Races[i];
                    if(race.date !== undefined) {
                        let dt = race.date + 'T' + race.time;
                        $scope.season.Races[i]['results'] = Date.parse(race.date) < $scope.today;
                        $scope.season.Races[i]['dt'] = dt;
                        $scope.season.Races[i]['localeTime'] = new Date(dt).toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});

                        let qualiDt = race.Qualifying.date + 'T' + race.Qualifying.time;
                        $scope.season.Races[i]['Qualifying']['results'] = Date.parse(race.Qualifying.date) < $scope.today;
                        $scope.season.Races[i]['Qualifying']['dt'] = qualiDt;
                        $scope.season.Races[i]['Qualifying']['localeTime'] = new Date(qualiDt).toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});

                        if (race?.Sprint) {
                            let sprintDt = race.Sprint.date + 'T' + race.Sprint.time;
                            $scope.season.Races[i]['Sprint']['results'] = Date.parse(race.Sprint.date) < $scope.today;
                            $scope.season.Races[i]['Sprint']['dt'] = sprintDt;
                            $scope.season.Races[i]['Sprint']['localeTime'] = new Date(sprintDt).toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});
                        }

                    }
                }
            }
          });

      })

    .controller('ResultsCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'https://ergast.com/api/f1/';
        $scope.sort = 'position';
        var numbers = [
            'position',
            'number',
            'points',
            'grid',
            'laps',
            'millis',
            'rank',
            'lap',
            'speed'
        ];

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/results.json'}).success(function(data) {
            $scope.results = data.MRData.RaceTable.Races[0];

            angular.forEach($scope.results.Results, function(result, idx) {
                for(var i in result) {
                    if(result.hasOwnProperty(i) && numbers.indexOf(i) !== -1) {
                        result[i] = parseInt(result[i], 10);
                    }
                }
                result.change = {};
                result.gridText = result.grid === 0 ? 'Pit' : result.grid;
                if(result.grid > 0) {
                    result.change.type = (result.grid - result.position > 0
                        ? 'arrow-circle-up'
                        : (result.grid === result.position
                            ? 'minus-circle'
                            : 'arrow-circle-down'
                        )
                        );
                        result.change.amount = Math.abs(result.grid - result.position);
                } else {
                    result.change.type = result.position === $scope.results.Results.length ? 'minus-circle' : 'arrow-circle-up';
                    result.change.amount = Math.abs($scope.results.Results.length - result.position);
                }
            });

            $http({method: 'get', url: $scope.baseurl + 'current/' + $scope.results.round
              + '/driverStandings.json'}).success(function(driverStandingsData) {
                $scope.driverStandings = driverStandingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
              });

            $http({method: 'get', url: $scope.baseurl + 'current/' + $scope.results.round
              + '/constructorStandings.json'}).success(function(constructorStandingsData) {
                $scope.constructorStandings = constructorStandingsData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
              });
          });
      })

    .controller('QualiCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'https://ergast.com/api/f1/';
        $scope.sort = 'position'
        var numbers = [
            'position',
            'number'
        ];

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });


        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/qualifying.json'}).success(function(data) {
            $scope.race = data.MRData.RaceTable.Races[0];
            $scope.quali = data.MRData.RaceTable.Races[0].QualifyingResults;
            angular.forEach($scope.quali, function(result) {
                for(var i in result) {
                    if(result.hasOwnProperty(i) && numbers.indexOf(i) !== -1) {
                        result[i] = parseInt(result[i], 10);
                    }
                }
            });
          });
      })

    .controller('SprintCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'https://ergast.com/api/f1/';
        $scope.sort = 'position';
        var numbers = [
            'position',
            'number',
            'points',
            'grid',
            'laps',
            'millis',
            'rank',
            'lap',
            'speed'
        ];

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/sprint.json'}).success(function(data) {
            $scope.results = data.MRData.RaceTable.Races[0];

            angular.forEach($scope.results.SprintResults, function(result, idx, arr) {
                for(var i in result) {
                    if(result.hasOwnProperty(i) && numbers.indexOf(i) !== -1) {
                        result[i] = parseInt(result[i], 10);
                    }
                }
                result.change = {};
                result.gridText = result.grid === 0 ? 'Pit' : result.grid;
                if(result.grid > 0) {
                    result.change.type = (result.grid - result.position > 0
                        ? 'arrow-circle-up'
                        : (result.grid === result.position
                            ? 'minus-circle'
                            : 'arrow-circle-down'
                        )
                        );
                        result.change.amount = Math.abs(result.grid - result.position);
                } else {
                    result.change.type = result.position === $scope.results.SprintResults.length ? 'minus-circle' : 'arrow-circle-up';
                    result.change.amount = Math.abs($scope.results.SprintResults.length - result.position);
                }
            });
          });
      })

    .controller('DriverCtrl', function ($scope, $http, $routeParams) {
        $scope.baseurl = 'https://ergast.com/api/f1/';
        var url = $scope.baseurl;

        if (!$routeParams.season || !$routeParams.round) {
          url += 'current';
        } else {
          url += $routeParams.season + '/' + $routeParams.round;
        }

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
          });

        $http({method: 'get', url: url + '/driverStandings.json'}).success(function(data) {
            $scope.standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
          });
      })

    .controller('ConstructorCtrl', function ($scope, $http, $routeParams) {
        $scope.baseurl = 'https://ergast.com/api/f1/';

        var url = $scope.baseurl;

        if (!$routeParams.season || !$routeParams.round) {
          url += 'current';
        } else {
          url += $routeParams.season + '/' + $routeParams.round;
        }

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: url + '/constructorStandings.json'}).success(function(data) {
            $scope.standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
          });
      });

angular.module('f1Filters', [])
    .filter('helmet', function() {
        return function(driver, $scope) {
            return $scope.lookup.url + $scope.lookup.helmet.replace('{driver_id}', $scope.lookup.ids.drivers[driver]);
        };
      })
    .filter('profile', function() {
        return function(driver, $scope) {
            return $scope.lookup.url + $scope.lookup.profile.replace('{driver_id}', $scope.lookup.ids.drivers[driver]);
        };
      })
    .filter('portrait', function() {
        return function(driver, $scope) {
            return $scope.lookup.url + $scope.lookup.portrait.replace('{driver_id}', $scope.lookup.ids.drivers[driver]);
        };
      });
