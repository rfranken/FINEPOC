'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngResource',
  'myApp.version'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/multirow', {
                templateUrl: 'partials/multiRow.html',
                controller: 'multiRowCtrl'
                }
            )
            .when('/singlerow', {
                templateUrl: 'partials/singleRow.html',
                controller: 'singleRowCtrl'
                }
            )
            .otherwise({redirectTo: '/multirow'});
}])
    .controller('multiRowCtrl', function( $scope, $http) {
        console.log('in de multiRowCtrl controller')

        $http.get('http://wlo1.open-i.nl:8888/rest/fine/finecr%24products?app_name=Fine')
            .success(function(response){
                console.log('data wordt ververst');
                // De rijen zitten in een 'record' node, dus:
                $scope.Products = response.record;
                console.log('data is ververst');
                //     $scope.emp ="";
            })
            .error(function(response){
                console.log('Fout: ' +response);
            })

        console.log('ljdflkdsjf');
    })

    .controller('singleRowCtrl', function() {
        console.log('in de singleRowCtrl controller')
    });