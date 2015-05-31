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
        return $resource('http://wlo1.open-i.nl:8888/rest/fine/_proc/TEST',
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
            $scope.counters.executeQuery();
            window.location.href = "#/meteropnamen";
        }


        //        ------------------- meters reading + meter placement ------------------------

        $scope.meterPlacements      = {};
        $scope.meterReadings        = {};
        $scope.meterReadingDetails  = {};
        $scope.meterReadings.record = {}
        $scope.meterReadings.insertInOperation = false;
        $scope.meterReadings.insertSuccessful = false;
        $scope.meterReadingsParamsObj = {}
        $scope.meterReadings = {};

        $scope.counters = {};
        $scope.countersParamsObj = {}

        $scope.stand= {}
        $scope.stand.pattern = new RegExp("^[0-9]*$"); // alleen numeriek
        $scope.counters.executeQuery = function(){
            $scope.countersParamsObj.fields   = 'COP_ID,COP_NAME,WHEELS,DECIMALS,CTG_ID,MRT_AUD_DATE_CREATED,STAND'
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



        $scope.createMeterPlacement = function () {
            // Roep Stored Procedure aan om:
            // Een METER PLACEMENT aan te maken
            // Een METER READING aan te maken
            // Een of meerdere METER READING DETAILS aan te maken:

            // METER PLACEMENT record samenstellen:
            $scope.createMeterPlacement.InOperation= true; // throbber GIFje aanzetten
            $scope.meterPlacements.record = {};
            $scope.meterPlacements.record.CCN_ID    = $scope.connections.selectedRow.ID;
            $scope.meterPlacements.record.MTR_ID    = $scope.meters.selectedRow.ID;
            // Uit scherm:
            $scope.meterPlacements.record.STARTDATE = $scope.meterReadings.record.RECORDING_DATE;
            $scope.meterPlacements.record.MTP_TYPE  = 'MW';

            // METER READINGS record samenstellen:
            $scope.meterReadings.record.MTR_ID         = $scope.meters.selectedRow.ID;
            $scope.meterReadings.record.REASON         = 'PLAATSING';
            // Uit scherm:
            //$scope.meterReadings.record.RECORDING_DATE
            //$scope.meterReadings.record.METHOD
            //
            // De METER READING DETAILS zitten in een array van objecten:
            for (var i = 0; i < $scope.counters.recordSet.record.length; i++) {
                 delete $scope.counters.recordSet.record[i].$$hashKey;
            }

            $scope.meterReadingDetails.array =   $scope.counters.recordSet.record;


            // Dit is de inhoud in JSON die als VALUE moet worden aangeboden:
            var valueJSON = {  mtp : $scope.meterPlacements.record
                                  ,  mrd : $scope.meterReadings.record
                                  ,  mrt : $scope.meterReadingDetails.array
            };

            // Als String notatie
            var valueString         = JSON.stringify(valueJSON);
            // En tenslotte escaped omdat anders de Stored Procedure in de war raakt:
            var valueStringEscaped  = valueString.replace(/"/g,'\\"') //goed  // Deze werkt:


            //
            var aanroep = {};

            aanroep.params = [
                {
                    name       : "P_1",
                    value      : valueStringEscaped
                }
            ];

            metersPlacementResource.save( aanroep,
                function(result) {
                    //handle success
                    // Throbber uitzetten...
                    $scope.createMeterPlacement.InOperation = false;
                    // toon OK symbool:
                    $scope.createMeterPlacement.Successful  = true;
                    // ...en toon en vul het counters blok:
                   $scope.counters.executeQuery();
                },
                function(errorResult) {
                    // Throbber uitzetten...
                    $scope.createMeterPlacement.InOperation = false;
                    $scope.createMeterPlacement.Successful = false;
                    // Vul fout:
                    $scope.errorResource = errorResult.data.error[0];
                })



        };





    });

