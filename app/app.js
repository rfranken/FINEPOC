'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.version'
])
    .service("IDUpdate", function($rootScope) {
        return {
            setID: function(type, id) {
                this[type] = id;
                $rootScope.$broadcast("IDUpdated", {
                    type: type, recID: id
                });
            }
        }
    })
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/multirow'  , {templateUrl: 'partials/multiRow.html', controller: 'multiRowCtrl'}).
            when('/singlerow' , {redirectTo:  'partials/singleRow.html'}).
            when('/edit/:id'  , {templateUrl: 'partials/singleRow.html', controller: 'singleRowCtrl'}).
            when('/add'       , {templateUrl: 'partials/singleRow.html', controller: 'singleRowCtrl'}).
            otherwise(          {templateUrl: 'partials/multiRow.html',controller: 'multiRowCtrl'});
    }])
    .controller('multiRowCtrl', function( $scope, $http, IDUpdate) {

        console.log('in de multiRowCtrl controller')


        var refresh = function() {
            $http.get('http://wlo1.open-i.nl:8888/rest/fine/finecr%24products?app_name=Fine')
                .success(function(response){
                    console.log('data wordt ververst');
                    // De rijen zitten in een 'record' node, dus:
                    $scope.productlist = response.record;
                    console.log('data is ververst');
                    //     $scope.emp ="";
                })
                .error(function(response){
                    console.log('Fout: ' +response);
                })
        }

        console.log("Refresh scope.");
        refresh();

        $scope.edit = function(id) {
            console.log(id);
            $scope.modus = 'UPDATE';
            window.location.href = "#/edit/" + id;
        }


    })


    .controller('singleRowCtrl', ['$scope','$http', '$routeParams', function ($scope,$http,$routeParams) {
        console.log('singlerow...')
        if (angular.isDefined($scope.productlist)) {
            console.log('id=' + $routeParams.id);
            $scope.product = $scope.productlist[$routeParams.id];
        } else {
            console.log('$scope.productlist is niet gedefinieerd');
            // Reload is hier niet mogelijk, daarom terug naar hoofdscherm.
            // window.location.href = "/";
        }

        $scope.update = function () {
            console.log($scope.product.ID);
            $http.put('http://wlo1.open-i.nl:8888/rest/fine/EMP/' + $scope.product.ID + '?app_name=Fine', $scope.product).success(function(response) {
                console.log('update uitgevoerd')
            })

        }

    }]);
