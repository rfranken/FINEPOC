/**
 * Created by Roel on 21-5-2015.
 */
'use strict';

// Declare app level module which depends on views, and components
angular.module('mtpApp', [
    'ngRoute',
    'ngResource',
    'myApp.version'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when('/zoek'  , {templateUrl: 'partials/multiRow.html' }).
            otherwise(      {redirectTo: 'meterplaatsing.html'});
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

    .controller('meterPlaatsingCtrl',  function ($scope, $routeParams, TableService) {
        console.log('In de DML Controller...');
    });
