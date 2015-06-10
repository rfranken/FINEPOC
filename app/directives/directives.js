angular.module("meterPlaatsingApp", [])
    .directive("domainList", function () {
        return function (scope, element, attrs) {
            // implementation code will go here
            var data = scope[attrs["domainList"]]
            if (angular.isArray(data)) {
                // Openstaand: data-live-search="true"?
                var selectElem = angular.element('<select>');
                element.append(selectElem);
                for (var i = 0; i < data.length; i++) {
                    console.log("Item: " + data[i].name);
                    var a = angular.element('<option>');
                    selectElem.append(angular.element('<option>').text(data[i].name).val(data[i].code));
                }
            }
        }
    })
