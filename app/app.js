'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'ngResource',
    'angularModalService',
    'myApp.version'
])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/multirow'  , {templateUrl: 'partials/multiRow.html' }).
            when('/dml/:id'   , {templateUrl: 'partials/DMLForm.html'  , controller: 'dmlCtrl'}).
            when('/refresh'   , {templateUrl: 'partials/multiRow.html' , controller: 'multiRowCtrl'}).
            otherwise(          {templateUrl: 'partials/multiRow.html'});
    }])

    .factory('TableService', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'finecr$products'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                 query: {method: 'GET', isArray: false  },
                delete: {method: 'DELETE'}
            });
    })

    .controller('multiRowCtrl', function( $scope, TableService, ModalService) {
        "use strict";
        console.log('In de multiRowCtrl controller');

        $scope.paramsObj = {
            // Let op: geen spaties in onderstaande string!
            fields  : 'ID,NAME,TEXT,AUD_CREATED_BY',
            limit   : 10,
            offset  : 0,
            order   : 'TEXT ASC'
            // Voorbeeld Filter:
            ,filter  : 'NAME LIKE \'%' + '%\''
        };

        $scope.executeQuery  = function() {
            if(angular.isUndefined($scope.MR)) {
                $scope.MR= {
                    filterValueName : ''
                }
            };
            $scope.paramsObj = {
                filter  : 'NAME LIKE \'%'+ $scope.MR.filterValueName +'%\''
            };
            $scope.recordSet = TableService.query($scope.paramsObj);
            console.log("Refresh recordset.");
        }

        $scope.edit = function(id) {
            console.log(id);
            window.location.href = "#/dml/" + id + '?modus=UPDATE';
        };

        $scope.add = function() {
            console.log('Add');
            window.location.href = "#/dml/0?modus=INSERT";
        };


        $scope.delete = function(id) {
            console.log('Delete id=' + id);
            window.location.href = "#/dml/" + id + '?modus=DELETE';
        }


        $scope.executeQuery();

    })

    .controller('singleRowCtrl',  function ($scope, $routeParams, TableService) {
        console.log('singleRow ...')
    })

    .controller('dmlCtrl',  function ($scope, $routeParams, TableService) {
        console.log('DML...');
        // Afleiden formstatus:
        $scope.formStatus = $routeParams.modus;

        if (angular.isDefined($scope.recordSet.record) && $scope.formStatus!=='INSERT') {
            $scope.dmlRow = $scope.recordSet.record[$routeParams.id];
        } else {
            console.log('$scope.recordSet is niet gedefinieerd');
            // Reload is hier niet mogelijk, daarom terug naar hoofdscherm.
            //window.location.href = "multirow";
        }


        $scope.updateRow = function () {
            var dmlRow = this.dmlRow;
            $scope.dmlResult = 'Schrijft weg...';
            TableService.update( {id:dmlRow.ID}, dmlRow,
                function(result) {
                    // handle success
                    // like assign to a var or something
                    // here we just log it
                    $scope.dmlResult = 'Rij is gewijzigd.'
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

        // Dit match pattern wordt gebruikt om een numerieke waarde in het ID af te dwingen
        $scope.matchPatternID = new RegExp("^[0-9]*$");

        $scope.addRow = function() {
            $scope.dmlResult = 'Schrijft weg...'
            TableService.save( $scope.dmlRow.ID, $scope.dmlRow,
                function(result) {
                    //handle success
                    $scope.dmlResult = 'Rij is toegevoegd.'
                },
                function(error) {
                    $scope.dmlResult = 'Error: ' + error.status + ':' + error.data.error[0].message;
                })
        };

        $scope.deleteRow = function() {
            var dmlRow = this.dmlRow;
            $scope.dmlResult = 'Schrijft weg...';
            TableService.delete( {id:dmlRow.ID},
                function(result) {
                    //handle success
                    $scope.dmlResult = 'Rij is verwijderd.'
                },
                function(error) {
                    $scope.dmlResult = 'Error: ' + error.status + ':' + error.data.error[0].message;
                })
        }

        // Leidt af welke knoppen getoond moeten worden:
        $scope.showButton = function(button,formIsValid, pristine, status){
            if (button=='UPDATE') {
                return ( formIsValid && !pristine && status=='UPDATE'  )
            }
            if (button=='DELETE') {
                return (  status=='DELETE'  )
            }
            if (button=='INSERT') {
                return ( formIsValid && !pristine && status=='INSERT'  )
            }
            // Geeft TRUE terug indien er GEEN button wordt getoond:
            if (button=='NONE') {
                return     !(  (formIsValid && !pristine && status=='UPDATE' )
                            || (                            status=='DELETE' )
                            || ( formIsValid&& !pristine && status=='INSERT' )
                            )
            }
        }


    })




