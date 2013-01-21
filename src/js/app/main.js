/*jslint browser: true, sloppy: true, vars: true */
/*global define: false */
define(['./model', './dom', 'json3', './geolocation', './google', './geography'], function (model, dom, JSON3, geolocation, google, geography) {
    'use strict';
    
    function main() {
        // 1. show stored location
        var data = model.get();
        dom.byId('debug_output').innerHTML += JSON3.stringify(data, null, 4) + '\n';
        // 2. load current location
        var positionPromise = geolocation.getCurrentPosition();
        positionPromise
        .then(function (position) {
            dom.byId('debug_output').innerHTML += JSON3.stringify(position, null, 4) + '\n';
        });
        var latlngPromise = positionPromise
        .then(geolocation.convertPositionToLatLng);
        latlngPromise
        .then(google.reverseGeocode)
        .then(function (address) {
            dom.byId('debug_output').innerHTML += JSON3.stringify(address, null, 4) + '\n';
        }, function (reason) {
            dom.byId('debug_output').innerHTML += 'error ' + reason;
        });
        // 3. show distance and heading
        // 4. do reverce geolocation
    }
    
    return main;
});