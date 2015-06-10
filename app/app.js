/**
 * Created by Roel on 07-06-2015.
 */

'use strict';

angular.module('meterPlaatsingApp', [
    'ngRoute',
    'ngResource',
    'ui.bootstrap'
])
    .constant('RESOURCE_URL','http://wlo1.open-i.nl:8888/rest/fine/')
    .constant('MAX_FETCH_SIZE',50)

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.
            when     (  '/'               , {templateUrl: 'partials/multiRowConnections.html' }).
            when     (  '/meters'         , {templateUrl: 'partials/multiRowMeters.html' }).
            when     (  '/meteropnamen'   , {templateUrl: 'partials/meterOpnamen.html' }).
            otherwise(                      {templateUrl: 'partials/multiRowConnections.html'});
    }])

    // Read-only Resource om Aansluitingen op te halen::
    .factory('connectionsResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource(RESOURCE_URL + 'finecr$connections',
            {
                app_name    : 'Fine'
            },
            {  query:  {method: 'GET', isArray: false  }
            }
        );
    })

    // Read-only Resource om Meters op te halen:
    .factory('metersResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource(RESOURCE_URL + 'v_finecr$meters',
            {
                app_name    : 'Fine'
            },
            {   query:  {method: 'GET', isArray: false  }
            });
    })

    // Read-only Resource om Meter Placements op te halen:
    .factory('metersPlacementReadingResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource(RESOURCE_URL + 'v_finecr$meter_placement_read',
            {
                app_name    : 'Fine'
            },
            {   query:  {method: 'GET', isArray: false  }
            });
    })

    // Read-only Resource om Standen op te halen:
    .factory('meterReadingDetailsResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource( RESOURCE_URL + 'v_finecr$meter_reading_details',
            {
                app_name    : 'Fine'
            },
            {   query:  {method: 'GET', isArray: false  }
            });
    })

    // Read-only Resource om Counters (terlwerksoorten) op te halen (als er geen standen zijn):
    .factory('countersResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource(RESOURCE_URL + 'v_finecr$counters',
            {
                app_name    : 'Fine'
            },
            {   query:  {method: 'GET', isArray: false  }
            });
    })

    // DML Resource om meterplaating, meter reading en meter reading details weg te schrijven:
    .factory('metersPlacementDMLResource', function ($resource,RESOURCE_URL) {
        "use strict";
        return $resource(RESOURCE_URL + '_proc/TEST',
            {
                app_name    : 'Fine'
            },
            {   update: {method: 'PUT' },
                query:  {method: 'GET', isArray: false  },
                delete: {method: 'DELETE'}
            });
    })


    .controller('meterPlaatsingCtrl',  function ($scope,
                                                 MAX_FETCH_SIZE,
                                                 connectionsResource,
                                                 metersResource,
                                                 metersPlacementReadingResource,
                                                 meterReadingDetailsResource,
                                                 countersResource,
                                                 metersPlacementDMLResource
                                                )
    {
        console.log('In de meterPlaatsing Controller...')

//        ------------------- connections -------------------------------
        $scope.connections = {};
        $scope.connections.postCodePattern =   new RegExp("^[1-9][0-9]{3}");
        $scope.connectionsParamsObj = {
            // Let op: geen spaties in onderstaande string!
            fields        : 'ID,EAN_CODE,STARTDATE,ENDDATE,STREET,HOUSE_NUMBER,HOUSE_NUMBER_ADD,ZIP_CODE,PLACE',
            limit         : MAX_FETCH_SIZE,
            offset        : 0,
            order         : 'PLACE ASC,STREET ASC',
            include_count : true
            // Voorbeeld Filter:
            //    filter  : 'NAME LIKE \'%' + '%\''
        };

        $scope.connections.executeQuery  = function() {
            // Bepaal de filter, bijv:
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
                    $scope.errorResource    = false;
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
            $scope.meterPlacementReading.executeQuery();
            window.location.href = "#/meteropnamen";
        }
//        ------------------- meterplaatsingen ------------------------------------

//      Ophalen van de plaatsingstand voor een combinatie aansluiting - meter, indien die bestaat:
        $scope.meterPlacementReading      = {};
        $scope.meterPlacementReadingParamsObj = {};
        $scope.meterPlacementReading.exists = false;
        $scope.meterPlacementReading.executeQuery = function(){
            $scope.meterPlacementReadingParamsObj.fields   = 'MTP_ID,CCN_ID,MRD_ID,RECORDING_DATE,METHOD';
            var filter = 'CCN_ID=' + $scope.connections.selectedRow.ID + 'and MTR_ID=' + $scope.meters.selectedRow.ID;
            $scope.meterPlacementReadingParamsObj.filter = filter;
            $scope.meterPlacementReading.recordSet = metersPlacementReadingResource.query($scope.meterPlacementReadingParamsObj
                , function(result){
                    $scope.queryInOperation = false;
                    $scope.meterPlacementReading.record=$scope.meterPlacementReading.recordSet.record[0];
                    $scope.meterPlacementReading.exists=angular.isDefined($scope.meterPlacementReading.record);
                    console.log('succes!')
                    // Haal bijbehorende standen op indien er een meterplaatsing werd gevonden:
                    if ($scope.meterPlacementReading.exists) {
                        $scope.meterReadingDetailsParamsObj.filter = 'MRD_ID=' + $scope.meterPlacementReading.record.MRD_ID;
                        $scope.counters.recordSet={} // reset
                        $scope.meterReadingDetails.executeQuery();
                    }
                    // Indien er geen meterplaatsing werd gevonden: toon de in te vullen counter types:
                    else {
                        $scope.meterReadingDetails.recordSet={} // reset indien RELOAD heeft plaatsgevonden en deze ook bestond!
                        $scope.counters.executeQuery();
                    }
                }
                , function(errorResult) {
                    $scope.queryInOperation = false;
                    console.log('Fout:' + errorResult.data.error[0].message);
                    $scope.errorResource = errorResult.data.error[0];
                }
            )
        };

//        ------------------- standen-------------------------------

        $scope.meterReadingDetails = {};
        $scope.meterReadingDetailsParamsObj = {}
        $scope.meterReadingDetails.stand_pattern =  new RegExp("^[0-9]*$"); // alleen numeriek

        $scope.meterReadingDetails.executeQuery = function(){
            $scope.meterReadingDetails.fields   = 'COP_ID,COP_NAME,WHEELS,DECIMALS,CTG_ID,MRT_AUD_DATE_CREATED,STAND,MRD_ID'
            // Haal de details op van de gevonden meter reading:
            $scope.meterReadingDetails.recordSet = meterReadingDetailsResource.query($scope.meterReadingDetailsParamsObj
                , function(result){
                    $scope.queryInOperation = false;
                    console.log('meterReadingDetails: succes!')
                }
                , function(errorResult) {
                    $scope.queryInOperation = false;
                    console.log('Fout in meterReadingDetails:' + errorResult.data.error[0].message);
                    $scope.errorResource = errorResult.data.error[0];
                }
            )
        };//

        // ------------------- telwerksoorten-------------------------------

        $scope.counters = {};
        $scope.countersParamsObj = {}

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
            )
        };

        // -------------------wegschrijven -----------------------------
        $scope.createMeterPlacement = function () {
            // Roep Stored Procedure aan om:
            // Een METER PLACEMENT aan te maken
            // Een METER READING aan te maken
            // Een of meerdere METER READING DETAILS aan te maken:

            // METER PLACEMENT record samenstellen:
            $scope.createMeterPlacement.InOperation= true; // throbber GIFje aanzetten
            $scope.meterPlacement = {};
            $scope.meterPlacement.record = {};
            $scope.meterPlacement.record.ID        = $scope.meterPlacementReading.record.MTP_ID;
            $scope.meterPlacement.record.CCN_ID    = $scope.connections.selectedRow.ID;
            $scope.meterPlacement.record.MTR_ID    = $scope.meters.selectedRow.ID;
            // Uit scherm:
            $scope.meterPlacement.record.STARTDATE = $scope.meterPlacementReading.record.RECORDING_DATE;
            $scope.meterPlacement.record.MTP_TYPE  = 'MW';

            // METER READINGS record samenstellen:
            $scope.meterReading = {};
            $scope.meterReading.record = {};
            $scope.meterReading.record.MTR_ID         = $scope.meterPlacementReading.record.MRD_ID;
            $scope.meterReading.record.RECORDING_DATE = $scope.meterPlacementReading.record.RECORDING_DATE;
            $scope.meterReading.record.METHOD         = $scope.meterPlacementReading.record.METHOD;
            $scope.meterReading.record.REASON         = 'PLAATSING';

            // De METER READING DETAILS zitten in een array van objecten:
            for (var i = 0; i < $scope.counters.recordSet.record.length; i++) {
                delete $scope.counters.recordSet.record[i].$$hashKey;
            }

            $scope.meterReadingDetails.array =   $scope.counters.recordSet.record;

            // Dit is de inhoud in JSON die als VALUE moet worden aangeboden:
            var valueJSON =
            {      mtp : $scope.meterPlacement.record
                ,  mrd : $scope.meterReading.record
                ,  mrt : $scope.meterReadingDetails.array
            };

            // Als String notatie
            var valueString         = JSON.stringify(valueJSON);
            // En tenslotte escaped omdat anders de Stored Procedure in de war raakt:
            var valueStringEscaped  = valueString.replace(/"/g,'\\"');


            // Stel de aanroep samen
            var aanroep = {};

            aanroep.params = [
                {
                    name       : "P_1",
                    value      : valueStringEscaped
                }
            ];

            // Roep aan:
            metersPlacementDMLResource.save( aanroep,
                function(result) {
                    //handle success
                    // Throbber uitzetten...
                    $scope.createMeterPlacement.InOperation = false;
                    // toon OK symbool:
                    $scope.createMeterPlacement.Successful  = true;
                    // ...en toon en vul het meterstanden blok:
                    $scope.meterReadingDetailsParamsObj.filter = 'MRD_ID=' + $scope.meterPlacementReading.record.MRD_ID;
                    $scope.meterReadingDetails.executeQuery();                },
                function(errorResult) {
                    $scope.createMeterPlacement.InOperation = false;
                    $scope.createMeterPlacement.Successful = false;
                    // Vul fout:
                    $scope.errorResource = errorResult.data.error[0];
                })



        };
    });
