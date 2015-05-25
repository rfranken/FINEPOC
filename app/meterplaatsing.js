/**
 * Created by Roel on 21-5-2015.
 */
'use strict';

// Declare app level module which depends on views, and components
angular.module('mtpApp', [
    'ngRoute',
    'ngResource',
    'ui.bootstrap'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when     (  '/'               , {templateUrl: 'partials/multiRowConnections.html' }).
            when     (  '/meters'         , {templateUrl: 'partials/multiRowMeters.html' }).
            when     (  '/meteropnamen'   , {templateUrl: 'partials/meterOpnamen.html' }).
            otherwise(                      {templateUrl: 'partials/multiRowConnections.html'});
    }])

    .factory('connectionsResource', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'finecr$connections'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {  // update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  }
              //  delete: {method: 'DELETE'}
            });
    })
    .factory('metersResource', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'v_finecr$meters'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  },
                delete: {method: 'DELETE'}
            });
    })

    .factory('metersPlacementResource', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'finecr$meter_placements'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  },
                delete: {method: 'DELETE'}
            });
    })

    .factory('meterReadingsResource', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'finecr$meter_readings'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  }
            });
    })

    .factory('countersResource', function ($resource) {
        "use strict";
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/'+ 'v_finecr$counters'+ '/:id/',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  }
            });
    })


    .controller('meterPlaatsingCtrl',  function ($scope, $routeParams, connectionsResource,metersResource,meterReadingsResource,countersResource,metersPlacementResource) {
        console.log('In de meterPlaatsing Controller...');

        $scope.queryInOperation = false;
        $scope.errorResource    = false;

        //Connections:

        $scope.connections = {};
        $scope.connections.postCodePattern =   new RegExp("^[1-9][0-9]{3}");
        $scope.connections.filterValueName = '';
        $scope.connections.selectedRow = {};


        $scope.connectionsParamsObj = {
            // Let op: geen spaties in onderstaande string!
            fields        : 'ID,EAN_CODE,STARTDATE,ENDDATE,STREET,HOUSE_NUMBER,HOUSE_NUMBER_ADD,ZIP_CODE,PLACE',
            limit         : 50,
            offset        : 0,
            order         : 'PLACE ASC,STREET ASC',
            include_count : true
            // Voorbeeld Filter:
            //    filter  : 'NAME LIKE \'%' + '%\''
        };

        $scope.connections.executeQuery  = function() {
            // Bepaal de filter
            //STREET like 'Bazuin%' and ZIP_CODE like '3845 GB%'
            var filter = 'STREET like \'^STREET^\' and ZIP_CODE like \'^ZIP_CODE^\'';
            if (angular.isDefined($scope.connections.filterStreet)) {
                filter= filter.replace('^STREET^','%'+ $scope.connections.filterStreet +'%')
            }

            if (angular.isDefined($scope.connections.filterZipCode)) {
                // Let op: postcode heeft geen wildcard ervoor (anders werkt index niet!):
                filter=filter.replace('^ZIP_CODE^',$scope.connections.filterZipCode +'%')
            }
            filter=filter.replace('^STREET^','%%');
            filter=filter.replace('^ZIP_CODE^','%%');
            //
            $scope.connectionsParamsObj.filter = filter;
            $scope.queryInOperation = true;
            $scope.connections.recordSet = connectionsResource.query($scope.connectionsParamsObj
                , function(result){
                    $scope.queryInOperation = false;
                    console.log('succes!')
                }
                , function(errorResult) {
                    $scope.queryInOperation = false;
                    console.log('Fout:' + errorResult.data.error[0].message);
                    $scope.errorResource = errorResult.data.error[0];
                }
            );
            console.log("Refresh recordset Connections.");
        };


        $scope.selectConnection = function(index) {
            $scope.connections.selectedRow = $scope.connections.recordSet.record[index];
                    console.log('Index:' + index);
                    window.location.href = "#/meters";
        }

        //        ------------------- meters-------------------------------

        $scope.meters = {};
        $scope.meters.selectedRow = {};


        $scope.metersParamsObj = {
            // Let op: geen spaties in onderstaande string!
            fields        : 'ID,FACTORY_NUMBER,INDICATIE_TEMPERATUURHERL,CTG_ID,CAT_NAME,CAT_TEXT,PRD_NAME',
            limit         : 50,
            offset        : 0,
            order         : 'FACTORY_NUMBER ASC',
            include_count : true
        };

        $scope.meters.executeQuery  = function() {
            var filter = 'FACTORY_NUMBER like \'^FACTORY_NUMBER^\' and PRD_NAME like \'^PRD_NAME^\'';
            if (angular.isDefined($scope.meters.filterFactoryNumber)) {
                filter= filter.replace('^FACTORY_NUMBER^','%'+ $scope.meters.filterFactoryNumber +'%')
            }

            if (angular.isDefined($scope.meters.filterProductName)) {
                filter=filter.replace('^PRD_NAME^',$scope.meters.filterProductName +'%')
            }
            filter=filter.replace('^FACTORY_NUMBER^','%%');
            filter=filter.replace('^PRD_NAME^','%%');
            //
            $scope.metersParamsObj.filter = filter;
            $scope.queryInOperation = true;
            $scope.meters.recordSet = metersResource.query($scope.metersParamsObj
                , function(result){
                    $scope.queryInOperation = false;
                    console.log('succes!')
                }
                , function(errorResult) {
                    $scope.queryInOperation = false;
                    console.log('Fout:' + errorResult.data.error[0].message);
                    $scope.errorResource = errorResult.data.error[0];
                }
            );
            console.log("Refresh recordset Meters.");
        };


        $scope.selectMeter = function(index) {
            $scope.meters.selectedRow = $scope.meters.recordSet.record[index];
            console.log('Index:' + index);
            window.location.href = "#/meteropnamen";
        }


        //        ------------------- meters reading + meter placement ------------------------

        $scope.meterPlacements = {};
        $scope.meterReadings = {};
        $scope.meterReadings.record = {}
        $scope.meterReadings.insertInOperation = false;
        $scope.meterReadings.insertSuccessful = false;
        $scope.meterReadingsParamsObj = {}
        $scope.meterReadings = {};

        $scope.counters = {};
        $scope.countersParamsObj = {}

        $scope.counters.executeQuery = function(){
        $scope.countersParamsObj.fields   = 'COP_NAME,WHEELS,DECIMALS,CTG_ID'
        // Haal de telwerkeen op van de categorie van de gekozen meter:
        var filter = 'CTG_ID = ' + $scope.meters.selectedRow.CTG_ID;
        $scope.countersParamsObj.filter = filter;
        $scope.counters.recordSet = countersResource.query($scope.countersParamsObj
            , function(result){
                $scope.queryInOperation = false;
                console.log('succes!')
            }
            , function(errorResult) {
                $scope.queryInOperation = false;
                console.log('Fout:' + errorResult.data.error[0].message);
                $scope.errorResource = errorResult.data.error[0];
            }
        )};

        // Maak een METER PLACEMENT aan:
        // Deze moet eerst omdat hier fouten door gebruikersinvoer kunnen optreden:
        $scope.meterPlacements.register = function () {
            $scope.meterReadings.insertInOperation = true; // throbber aanzetten:
            $scope.meterPlacements.record = {};
            $scope.meterPlacements.record.CCN_ID    = $scope.connections.selectedRow.ID;
            $scope.meterPlacements.record.MTR_ID    = $scope.meters.selectedRow.ID;
            $scope.meterPlacements.record.STARTDATE = $scope.meterReadings.record.RECORDING_DATE;
            $scope.meterPlacements.record.MTP_TYPE  = 'MW';
            metersPlacementResource.save( $scope.meterPlacements.record,
                function(result) {
                    //handle success
                    // Maak de meterplaatsing aan:
                    $scope.meterReadings.register();
                },
                function(errorResult) {
                    $scope.meterReadings.insertInOperation = false;
                    $scope.meterReadings.insertSuccessful = false;
                    $scope.errorResource = errorResult.data.error[0];
                })

        };

        // Maak een METER READING aan:
        $scope.meterReadings.register = function() {
            $scope.meterReadings.record.ID     = 9999;// Tja, Dreamfactory kan geen door de DB gegenereerde ID teruggeven(?!), dus daarom maar zo.
            $scope.meterReadings.record.MTR_ID = $scope.meters.selectedRow.ID;
            $scope.meterReadings.record.REASON = 'PLAATSING';
            meterReadingsResource.save( $scope.meterReadings.record.ID, $scope.meterReadings.record,
                function(result) {
                    //handle success
                    // Alles is goed gegaan:
                    // Throbber uitzetten...
                    $scope.meterReadings.insertInOperation = false;
                    // ...en toon en vul het counters blok:
                    $scope.meterReadings.insertSuccessful = true;
                    $scope.counters.executeQuery();
                },
                function(errorResult) {
                    $scope.meterReadings.insertInOperation = false;
                    $scope.meterReadings.insertSuccessful  = false;
                    $scope.errorResource = errorResult.data.error[0];
                    throw exception; // hier stoppen!
                })
        }



    });

