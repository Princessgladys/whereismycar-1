define(['./defer', './geography', './again'], function (defer, geography, again) {
    'use strict';
/*
nsIDOMGeoPosition
+------------------------------+--------------------------+----------------------------------------------------------------------+
|          Attribute           |           Type           |                             Description                              |
+------------------------------+--------------------------+----------------------------------------------------------------------+
| address Requires Gecko 1.9.2 | nsIDOMGeoPositionAddress | The address of the user's current location, if available. Read only. |
| coords                       | nsIDOMGeoPositionCoords  | The user's current position information. Read only.                  |
| timestamp                    | DOMTimeStamp             | The time at which the reading was taken. Read only.                  |
+------------------------------+--------------------------+----------------------------------------------------------------------+

nsIDOMGeoPositionCoords
+------------------+--------+--------------------------------------------------------------------------------------------------------------------+
|    Attribute     |  Type  |                                                    Description                                                     |
+------------------+--------+--------------------------------------------------------------------------------------------------------------------+
| latitude         | double | The user's current latitude, in degrees. Read only.                                                                |
| longitude        | double | The user's current longitude, in degrees. Read only.                                                               |
| altitude         | double | The user's current altitude, in meters. Zero if the device doesn't support altitude detection. Read only.          |
| accuracy         | double | The accuracy of position information, in meters. Read only.                                                        |
| altitudeAccuracy | double | The accuracy of altitude information, in meters. Zero if the device doesn't support altitude detection. Read only. |
| heading          | double | The current heading at which the user is moving, in degrees. Read only.                                            |
| speed            | double | The speed at which the user is moving, in meters per second (confirm this). Read only.                             |
+------------------+--------+--------------------------------------------------------------------------------------------------------------------+

        model.current_position.timestamp = (new Date()).getTime();
        model.current_position.latitude = position.coords.latitude;
        model.current_position.longitude = position.coords.longitude;
        model.current_position.accuracy = position.coords.accuracy;
        model.heading_deg = position.coords.heading;
*/

    var win = window;

    function isGeolocationSupported() {
        return win.navigator.hasOwnProperty('geolocation');
    }

    function getCurrentPosition() {
        var deferred = defer(),
        timeoutid;
        if (isGeolocationSupported()) {
            var timeoutHandler = function () {
                deferred.reject(new Error('Timed out'));
            };
            var successHandler = function (geoPosition) {
                win.clearTimeout(timeoutid);
                deferred.resolve(geoPosition);
            };
            var errorHandler = function (geoPositionError) {
                win.clearTimeout(timeoutid);
                deferred.reject(geoPositionError);
            };
            var options = {
                enableHighAccuracy: true,
                timeout: 5000, //ms
                maximumAge: 10000 //ms
            };
            timeoutid = win.setTimeout(timeoutHandler, 5000);
            win.navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
        } else {
            /*
            win.setTimeout(function () {
                deferred.resolve({
                    'timestamp': 1359302664666,
                    'coords': {
                        'speed': null,
                        'heading': null,
                        'altitudeAccuracy': null,
                        'accuracy': 666,
                        'altitude': null,
                        'longitude': 3.7228666,
                        'latitude': 51.0522666
                    }
                });
            }, 1000);
            */
            deferred.reject(new Error('Geolocation unsupported'));
        }
        return deferred.promise;
    }

    function convertPositionToLatLng(position) {
        return new geography.LatLng(position.coords.latitude, position.coords.longitude);
    }

    return {
        isSupported: isGeolocationSupported,
        getCurrentPosition: again(getCurrentPosition),
        convertPositionToLatLng: convertPositionToLatLng
    };
});