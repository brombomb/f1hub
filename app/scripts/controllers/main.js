'use strict';

angular.module('f1App')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.today = new Date();
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
    
        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });
    
        $http({method: 'get', url: $scope.baseurl + "current" }).success(function(data) {
            $scope.season = data.MRData.RaceTable;
            angular.forEach($scope.season.Races, function(race, index) {
                if(race.date !== undefined) {
                    let raceDate = new Date(race.date + 'T' + race.time);
                    race.dt = raceDate;
                    race.results = raceDate < $scope.today;
                    race.localeTime = raceDate.toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});

                    if (race.Qualifying) {
                        let qualiDate = new Date(race.Qualifying.date + 'T' + race.Qualifying.time);
                        race.Qualifying.dt = qualiDate;
                        race.Qualifying.results = qualiDate < $scope.today;
                        race.Qualifying.localeTime = qualiDate.toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});
                    } else {
                        race.Qualifying = {
                            date: race.date,
                            time: "14:00:00Z",
                            dt: new Date(race.date + 'T14:00:00Z'),
                            results: false,
                            localeTime: new Date(race.date + 'T14:00:00Z').toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'})
                        };
                    }

                    if (race.Sprint) {
                        let sprintDate = new Date(race.Sprint.date + 'T' + race.Sprint.time);
                        race.Sprint.dt = sprintDate;
                        race.Sprint.results = sprintDate < $scope.today;
                        race.Sprint.localeTime = sprintDate.toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});
                    }
                }
            });
        });
    })

    .controller('ResultsCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
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

        $http({method: 'get', url: $scope.baseurl + 'circuits/' + $routeParams.circuitId + '/results/'}).success(function(data) {
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

            $http({method: 'get', url: $scope.baseurl + $scope.results.season + "/" + $scope.results.round
              + '/driverStandings'}).success(function(driverStandingsData) {
                $scope.driverStandings = driverStandingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
              });

            $http({method: 'get', url: $scope.baseurl + $scope.results.season + "/" + $scope.results.round
              + '/constructorStandings'}).success(function(constructorStandingsData) {
                $scope.constructorStandings = constructorStandingsData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
              });
          });
      })

    .controller('QualiCtrl', function ($scope, $http, $routeParams) {

        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
        $scope.sort = 'position'
        var numbers = [
            'position',
            'number'
        ];

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });


        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/qualifying'}).success(function(data) {
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

        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
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

        $http({method: 'get', url: $scope.baseurl + 'current/circuits/' + $routeParams.circuitId + '/sprint'}).success(function(data) {
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
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
        var url = $scope.baseurl;

        if (!$routeParams.season || !$routeParams.round) {
          url += 'current';
        } else {
          url += $routeParams.season + '/' + $routeParams.round;
        }

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
          });

        $http({method: 'get', url: url + '/driverStandings'}).success(function(data) {
            $scope.standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
          });
      })

    .controller('ConstructorCtrl', function ($scope, $http, $routeParams) {
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';

        var url = $scope.baseurl;

        if (!$routeParams.season || !$routeParams.round) {
          url += 'current';
        } else {
          url += $routeParams.season + '/' + $routeParams.round;
        }

        $http({method: 'get', url: 'f1.json'}).success(function(data) {
            $scope.lookup = data;
        });

        $http({method: 'get', url: url + '/constructorStandings'}).success(function(data) {
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
