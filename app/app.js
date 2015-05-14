'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngResource',
    'myApp.version'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/multirow'  , {templateUrl: 'partials/multiRow.html', controller: 'multiRowCtrl'}).
            when('/singlerow' , {redirectTo:  'partials/singleRow.html', controller: 'singleRowCtrl'}).
            when('/edit/:id'  , {templateUrl: 'partials/DMLForm.html', controller: 'dmlCtrl'}).
            when('/add'       , {templateUrl: 'partials/DMLForm.html', controller: 'dmlCtrl'}).
            otherwise(          {templateUrl: 'partials/multiRow.html'});
    }])
    .factory('Product', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/finecr%24products/:id/',
            {
                app_name    : 'Fine'
            },
            {  update: { method: 'PUT' },
               query:  {method: 'GET', isArray: false  }
            });
    })
    .controller('multiRowCtrl', function( $scope, Product) {
        "use strict";

        console.log('in de multiRowCtrl controller')

        $scope.action="Add";

        console.log("Refresh scope.");

        $scope.paramsObj = {
            fields  : 'ID, NAME,TEXT,AUD_CREATED_BY',
            limit   : 10,
            offset  : 0,
            order   : 'TEXT ASC'
        }
        $scope.modus ='QUERY';
        $scope.recordSet = Product.query($scope.paramsObj);

        $scope.edit = function(id) {
            console.log(id);
            $scope.modus = 'UPDATE';
            window.location.href = "#/edit/" + id;
        }

        $scope.add = function() {
            console.log('Add');
            $scope.modus = 'ADD';
            console.log ('Scope.modus is gezet op ADD');
            window.location.href = "#/add/";
        }

    })

    .controller('singleRowCtrl',  function ($scope, $routeParams, Product) {
        console.log('singleRow ...')
    })

    .controller('dmlCtrl',  function ($scope, $routeParams, Product) {
        console.log('DML...')
        if (angular.isDefined($scope.recordSet.record)) {
            console.log('modus:' + $scope.modus);
            $scope.dmlRow = $scope.recordSet.record[$routeParams.id];
        } else {
            console.log('$scope.recordSet is niet gedefinieerd');
            // Reload is hier niet mogelijk, daarom terug naar hoofdscherm.
            //window.location.href = "multirow";
        }

        $scope.updateItem = function () {
            var dmlRow = this.dmlRow;

            Product.update( {id:dmlRow.ID}, dmlRow,
            function(result) {
                // handle success
                // like assign to a var or something
                // here we just log it
                console.log(result)
            },
            function(error) {
                //console.log('Error: ' + error.status + ':' + error.statusText);
                $scope.dmlResult = 'Error: ' + error.status + ':' + error.statusText;
            });

        }

        var updateByAttr = function(arr, attr1, value1, newRecord){
            if(!arr){
                return false;
            }
            var i = arr.length;
            while(i--){
                if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){
                    arr[i] = newRecord;
                }
            }
            return arr;
        };

        // FALSE hides the commit button:
        $scope.somethingToCommit = false;

        $scope.change = function() {
            $scope.somethingToCommit = true;
        }


        $scope.addRow = function() {
            console.log('ik doe een insert');
            Product.save( {id:$scope.newRow.ID}, $scope.newRow )
         }



    });