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
            when('/edit/:id'  , {templateUrl: 'partials/singleRow.html', controller: 'singleRowCtrl'}).
            when('/add'       , {templateUrl: 'partials/singleRow.html', controller: 'singleRowCtrl'}).
            otherwise(          {templateUrl: 'partials/multiRow.html'});
    }])
    .factory('Product', function ($resource) {
        "use strict";
       // return $resource('http://wlo1.open-i.nl:8888/rest/fine/finecr%24products/:id/?app_name=Fine&fields=ID%2CNAME%2CTEXT%2CAUD_CREATED_BY', {},
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
        $scope.productlist = Product.get($scope.paramsObj);

        $scope.edit = function(id) {
            console.log(id);
            $scope.modus = 'UPDATE';
            window.location.href = "#/edit/" + id;
        }

        $scope.add = function() {
            console.log('Add');
            $scope.modus = 'ADD';
            window.location.href = "#/add/";
        }

    })

    .controller('singleRowCtrl',  function ($scope, $routeParams, Product) {
        console.log('singlerow...')
        if (angular.isDefined($scope.productlist.record)) {
            console.log('id=' + $routeParams.id);
            $scope.product = $scope.productlist.record[$routeParams.id];
        } else {
            console.log('$scope.productlist is niet gedefinieerd');
            // Reload is hier niet mogelijk, daarom terug naar hoofdscherm.
            // window.location.href = "/";
        }

        $scope.updateItem = function () {
            var product = this.product;

            Product.update({id:product.ID}, product, function () {
                updateByAttr($scope.productlist.record, 'id', product.ID, product);

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




    });