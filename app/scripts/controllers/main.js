'use strict';

angular.module('f1App')
    .controller('MainCtrl', ['$scope', '$http', '$timeout', 'YearService', 'LookupService', function ($scope, $http, $timeout, YearService, LookupService) {
        $scope.today = new Date();
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        $scope.loadData = function() {
            var selectedYear = YearService.getSelectedYear();
            if (!selectedYear) {
                // YearService might not have loaded seasons yet.
                // If no seasons are available, try to fetch them
                if (YearService.getAvailableSeasons().length === 0) {
                    YearService.fetchSeasons();
                }
                return;
            }

            YearService.getSeasonData(selectedYear).then(function(seasonData) {
                if (!seasonData) {
                    return;
                }
                // Set the season data immediately
                $scope.season = seasonData;

                // Process the race data
                if ($scope.season && $scope.season.Races) {
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
                            // Ensure Qualifying object exists and has a predictable structure
                            race.Qualifying = race.Qualifying || {};
                            let qualiDateToUse = race.Qualifying.date ? race.Qualifying.date : race.date;
                            let qualiTimeToUse = race.Qualifying.time ? race.Qualifying.time : "14:00:00Z"; // Default time if not present
                            let fullQualiDateTime = new Date(qualiDateToUse + 'T' + qualiTimeToUse);

                            race.Qualifying.dt = fullQualiDateTime;
                            // Results should be based on whether the date is in the past
                            race.Qualifying.results = fullQualiDateTime < $scope.today;
                            race.Qualifying.localeTime = fullQualiDateTime.toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});
                        }

                        if (race.Sprint) {
                            let sprintDate = new Date(race.Sprint.date + 'T' + race.Sprint.time);
                            race.Sprint.dt = sprintDate;
                            race.Sprint.results = sprintDate < $scope.today;
                            race.Sprint.localeTime = sprintDate.toLocaleTimeString([], {timeZoneName: 'short', hour: 'numeric', minute:'2-digit'});
                        }
                    }
                    });
                }
            }).catch(function(error) {
                console.error('MainCtrl: Error loading season data', error);
                $scope.season = null;
            });
        };

        // Initialize controller
        // Try initial load immediately
        $scope.loadData();

        // Also try after a short delay in case services aren't ready
        $timeout(function() {
            if (!$scope.season) {
                $scope.loadData();
            }
        }, 100);

        // Watch for year changes
        var yearWatcher = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            if (newYear && (newYear !== oldYear || !$scope.season)) {
                $scope.loadData();
            }
        });

        // Also listen for seasons updated event
        var seasonsUpdatedListener = $scope.$on('seasonsUpdated', function() {
            $scope.loadData();
        });

        // Listen for route changes (when returning to home)
        var routeChangeListener = $scope.$on('$routeChangeSuccess', function(event, current, previous) {
            if (current.$$route && current.$$route.controller === 'MainCtrl' && !$scope.season) {
                $scope.loadData();
            }
        });

        $scope.$on('$destroy', function() {
            yearWatcher(); // Deregister the watcher
            seasonsUpdatedListener(); // Deregister the event listener
            routeChangeListener(); // Deregister the route change listener
        });
    }])

    .controller('ResultsCtrl', ['$scope', '$http', '$routeParams', 'YearService', 'LookupService', function ($scope, $http, $routeParams, YearService, LookupService) {

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

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        // Navigation variables
        $scope.previousRace = null;
        $scope.nextRace = null;

        $scope.loadData = function() {
            var selectedYear = YearService.getSelectedYear();
            if (!selectedYear || !$routeParams.circuitId) {
                return;
            }

            // Load navigation data using the cached service
            YearService.getRaceNavigation($routeParams.circuitId, selectedYear).then(function(navigation) {
                $scope.previousRace = navigation.previousRace;
                $scope.nextRace = navigation.nextRace;
            });

            $http({method: 'get', url: $scope.baseurl + selectedYear + '/circuits/' + $routeParams.circuitId + '/results/'}).then(function(response) {
                $scope.results = response.data.MRData.RaceTable.Races[0];

                if (!$scope.results) return; // Guard if no results for that year/circuit

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

                // These subsequent calls depend on $scope.results.season and $scope.results.round
                // which are populated by the primary API call above.
                if ($scope.results.season && $scope.results.round) {
                    $http({method: 'get', url: $scope.baseurl + $scope.results.season + "/" + $scope.results.round
                      + '/driverStandings'}).then(function(response) {
                        var driverStandingsData = response.data;
                        if (driverStandingsData.MRData.StandingsTable.StandingsLists && driverStandingsData.MRData.StandingsTable.StandingsLists.length > 0) {
                            $scope.driverStandings = driverStandingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                        } else {
                            $scope.driverStandings = []; // Handle empty standings
                        }
                      });

                    $http({method: 'get', url: $scope.baseurl + $scope.results.season + "/" + $scope.results.round
                      + '/constructorStandings'}).then(function(response) {
                        var constructorStandingsData = response.data;
                        if (constructorStandingsData.MRData.StandingsTable.StandingsLists && constructorStandingsData.MRData.StandingsTable.StandingsLists.length > 0) {
                            $scope.constructorStandings = constructorStandingsData.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
                        } else {
                            $scope.constructorStandings = []; // Handle empty standings
                        }
                      });
                } else {
                    $scope.driverStandings = [];
                    $scope.constructorStandings = [];
                }
            }).catch(function() {
                // Handle error for the main results call, e.g., clear data
                $scope.results = null;
                $scope.driverStandings = [];
                $scope.constructorStandings = [];
            });
        };

        // Initial load
        // $routeParams might not be immediately available on controller instantiation.
        // Watch for $routeParams.circuitId if it's not set, then load.
        // However, YearService also needs to be ready.
        // The watcher for YearService.getSelectedYear() will handle triggering loadData.
        // An initial call is made, and if selectedYear isn't ready, it returns early.
        $scope.loadData();

        // Watch for year changes
        var yearWatcherResults = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            if (newYear && newYear !== oldYear) {
                $scope.loadData();
            }
        });

        $scope.$on('$destroy', function() {
            yearWatcherResults();
        });
    }])

    .controller('QualiCtrl', ['$scope', '$http', '$routeParams', 'YearService', 'LookupService', function ($scope, $http, $routeParams, YearService, LookupService) {

        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';
        $scope.sort = 'position'
        var numbers = [
            'position',
            'number'
        ];

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        // Navigation variables
        $scope.previousRace = null;
        $scope.nextRace = null;

        $scope.loadData = function() {
            var selectedYear = YearService.getSelectedYear();
            if (!selectedYear || !$routeParams.circuitId) {
                return;
            }

            // Load navigation data using the cached service
            YearService.getRaceNavigation($routeParams.circuitId, selectedYear).then(function(navigation) {
                $scope.previousRace = navigation.previousRace;
                $scope.nextRace = navigation.nextRace;
            });

            $http({method: 'get', url: $scope.baseurl + selectedYear + '/circuits/' + $routeParams.circuitId + '/qualifying'}).then(function(response) {
                var data = response.data;
                if (data.MRData.RaceTable.Races && data.MRData.RaceTable.Races.length > 0) {
                    $scope.race = data.MRData.RaceTable.Races[0];
                    $scope.quali = data.MRData.RaceTable.Races[0].QualifyingResults;
                    angular.forEach($scope.quali, function(result) {
                        for(var i in result) {
                            if(result.hasOwnProperty(i) && numbers.indexOf(i) !== -1) {
                                result[i] = parseInt(result[i], 10);
                            }
                        }
                    });
                } else {
                    $scope.race = null;
                    $scope.quali = [];
                }
            }).catch(function() {
                $scope.race = null;
                $scope.quali = [];
            });
        };

        $scope.loadData();

        var yearWatcherQuali = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            if (newYear && newYear !== oldYear) {
                $scope.loadData();
            }
        });

        $scope.$on('$destroy', function() {
            yearWatcherQuali();
        });
    }])

    .controller('SprintCtrl', ['$scope', '$http', '$routeParams', 'YearService', 'LookupService', function ($scope, $http, $routeParams, YearService, LookupService) {

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

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        // Navigation variables
        $scope.previousRace = null;
        $scope.nextRace = null;

        $scope.loadData = function() {
            var selectedYear = YearService.getSelectedYear();
            if (!selectedYear || !$routeParams.circuitId) {
                return;
            }

            // Load navigation data using the cached service
            YearService.getRaceNavigation($routeParams.circuitId, selectedYear).then(function(navigation) {
                $scope.previousRace = navigation.previousRace;
                $scope.nextRace = navigation.nextRace;
            });

            $http({method: 'get', url: $scope.baseurl + selectedYear + '/circuits/' + $routeParams.circuitId + '/sprint'}).then(function(response) {
                var data = response.data;
                if (data.MRData.RaceTable.Races && data.MRData.RaceTable.Races.length > 0) {
                    $scope.results = data.MRData.RaceTable.Races[0];
                    if (!$scope.results.SprintResults) { // Ensure SprintResults exists
                        $scope.results.SprintResults = [];
                    }
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
                } else {
                    $scope.results = { SprintResults: [] }; // Ensure results.SprintResults is an empty array
                }
            }).catch(function() {
                $scope.results = { SprintResults: [] }; // Ensure results.SprintResults is an empty array on error
            });
        };

        $scope.loadData();

        var yearWatcherSprint = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            if (newYear && newYear !== oldYear) {
                $scope.loadData();
            }
        });

        $scope.$on('$destroy', function() {
            yearWatcherSprint();
        });
    }])

    .controller('DriverCtrl', ['$scope', '$http', '$routeParams', 'YearService', 'LookupService', function ($scope, $http, $routeParams, YearService, LookupService) {
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        $scope.loadData = function() {
            var yearToUse = $routeParams.season ? $routeParams.season : YearService.getSelectedYear();

            if (!yearToUse) { // Do not proceed if year is not determined
                $scope.standings = []; // Clear previous standings
                return;
            }

            var roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
            // If roundSegment is empty, we are fetching for the whole season.
            // If $routeParams.season is set, yearToUse is that season.
            // If $routeParams.season is not set, yearToUse is YearService.getSelectedYear().
            // The API for overall season standings doesn't need a /round part.
            // However, if $routeParams.round is present, $routeParams.season should also ideally be present.
            // The original logic was: if no season OR no round, use "current". Else use season/round.
            // New logic: if routeParams.season is present, use it. Otherwise use YearService.selectedYear.
            // If routeParams.round is present, add it to path.

            var url;
            if ($routeParams.season) { // If a specific season is in URL, use it with optional round
                yearToUse = $routeParams.season; // Override YearService if season is in route
                roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
                url = $scope.baseurl + yearToUse + roundSegment + '/driverStandings';
            } else { // No specific season in URL, use YearService selected year (round is optional)
                // For end-of-season standings, roundSegment will be empty.
                // For standings after a particular race of YearService.selectedYear, roundSegment will be populated (if $routeParams.round is in URL)
                // This case seems unlikely based on typical app flow (usually round implies season in URL)
                // But to be safe, we use yearToUse (which is YearService.getSelectedYear here)
                roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
                url = $scope.baseurl + yearToUse + roundSegment + '/driverStandings';
            }

            $http({method: 'get', url: url}).then(function(response) {
                var data = response.data;
                if (data.MRData.StandingsTable.StandingsLists && data.MRData.StandingsTable.StandingsLists.length > 0) {
                    $scope.standings = data.MRData.StandingsTable.StandingsLists[0].DriverStandings;
                } else {
                    $scope.standings = []; // Handle cases where no standings are returned
                }
            }).catch(function() {
                $scope.standings = []; // Clear on error
            });
        };

        // Initial load. loadData itself checks for yearToUse.
        $scope.loadData();

        // Watch for year changes from YearService. This is mainly for when no $routeParams.season is present.
        var yearWatcherDriver = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            // Only reload if $routeParams.season is not set, meaning we rely on YearService
            if (!newYear || newYear === oldYear) return;
            if (!$routeParams.season) {
                $scope.loadData();
            }
        });

        // Also watch for $routeParams changes, in case navigation changes season/round
        var routeWatcherDriver = $scope.$on('$routeChangeSuccess', function() {
            $scope.loadData();
        });

        $scope.$on('$destroy', function() {
            yearWatcherDriver();
            routeWatcherDriver(); // Deregister $routeChangeSuccess listener
        });
    }])

    .controller('ConstructorCtrl', ['$scope', '$http', '$routeParams', 'YearService', 'LookupService', function ($scope, $http, $routeParams, YearService, LookupService) {
        $scope.baseurl = 'https://api.jolpi.ca/ergast/f1/';

        LookupService.getLookupData().then(function(data) {
            $scope.lookup = data;
        });

        $scope.loadData = function() {
            var yearToUse = $routeParams.season ? $routeParams.season : YearService.getSelectedYear();

            if (!yearToUse) { // Do not proceed if year is not determined
                $scope.standings = []; // Clear previous standings
                return;
            }

            var roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
            var url;

            if ($routeParams.season) { // If a specific season is in URL, use it with optional round
                yearToUse = $routeParams.season; // Override YearService if season is in route
                roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
                url = $scope.baseurl + yearToUse + roundSegment + '/constructorStandings';
            } else { // No specific season in URL, use YearService selected year
                roundSegment = $routeParams.round ? '/' + $routeParams.round : '';
                url = $scope.baseurl + yearToUse + roundSegment + '/constructorStandings';
            }

            $http({method: 'get', url: url}).then(function(response) {
                var data = response.data;
                if (data.MRData.StandingsTable.StandingsLists && data.MRData.StandingsTable.StandingsLists.length > 0) {
                    $scope.standings = data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings;
                } else {
                    $scope.standings = []; // Handle cases where no standings are returned
                }
            }).catch(function() {
                $scope.standings = []; // Clear on error
            });
        };

        $scope.loadData();

        var yearWatcherConstructor = $scope.$watch(function() {
            return YearService.getSelectedYear();
        }, function(newYear, oldYear) {
            if (!newYear || newYear === oldYear) return;
            // Only reload if $routeParams.season is not set
            if (!$routeParams.season) {
                $scope.loadData();
            }
        });

        var routeWatcherConstructor = $scope.$on('$routeChangeSuccess', function() {
            $scope.loadData();
        });

        $scope.$on('$destroy', function() {
            yearWatcherConstructor();
            routeWatcherConstructor();
        });
    }]);

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
