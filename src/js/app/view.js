define(['./objects', './dom', './model', './timeago', './geography', './svg', './geometry', './google'], function (objects, dom, model, timeago, geography, svg, geometry, google) {
    'use strict';

    var defaultTimestamp = 0;
    var defaultImage = 'img/spacer.gif';
    var defaultAddress = 'Planet Earth';
    
    function cleanData(data) {
        data = objects.copy(data);
        data.current.timestamp = objects.nullToDefault(data.current.timestamp, defaultTimestamp);
        data.stored.timestamp = objects.nullToDefault(data.stored.timestamp, defaultTimestamp);
        data.current.img = objects.nullToDefault(data.current.img, defaultImage);
        data.stored.img = objects.nullToDefault(data.stored.img, defaultImage);
        data.current.address = objects.nullToDefault(data.current.address, defaultAddress);
        data.stored.address = objects.nullToDefault(data.stored.address, defaultAddress);
        return data;
    }
    
    function calculateRadarDotCoordinates(distance_m, heading_deg, bearing_deg, centerX_px, centerY_px, maxDistance_m, maxDistance_px) {
        var radius_px = Math.min(maxDistance_px, distance_m * maxDistance_px / maxDistance_m);
        var angle_dec = (270 + heading_deg + bearing_deg) % 360;
        var angle_rad = geometry.toRad(angle_dec);
        var x = Math.round(centerX_px + (radius_px * Math.cos(angle_rad)));
        var y = Math.round(centerY_px + (radius_px * Math.sin(angle_rad)));
        return new geometry.Point(x, y);
    }
    
    function updateRadar(bearing_deg, compassHeading_deg, distance_m) {
        var radarContentDocument = svg.getSvgContentDocumentById('radar');
        if (radarContentDocument !== null) {
            var dot = dom.byId('dot', radarContentDocument);
            var radarDotCoordinates = calculateRadarDotCoordinates(
                    distance_m, compassHeading_deg, bearing_deg,
                    160, 160, 300, 135);
            svg.setSvgCircleCenter(dot, radarDotCoordinates);
        }
    }
    
    function updateCompass(bearing_deg, compassHeading_deg) {
        var compassContentDocument = svg.getSvgContentDocumentById('compass');
        if (compassContentDocument !== null) {
            svg.setSvgElementRotate(dom.byId('dial', compassContentDocument), -1 * bearing_deg);
            svg.setSvgElementRotate(dom.byId('needle', compassContentDocument), compassHeading_deg);
        }
    }

    var currentData = cleanData(model.defaults);
    
    var updateCurrentImageTime = 0;
    var updateStoredImageTime = 0;
    
    function update(data) {
        var newData = cleanData(data);
        var currentTime = new Date().getTime();
        
        //status
        if (currentData.status !== newData.status) {
            dom.byId('debug_output').innerHTML = newData.status;
        }

        //current img
        if (currentTime - updateCurrentImageTime > 5000 &&
                data.current.accuracy < 150 &&
                newData.current.latitude !== null &&
                newData.current.longitude !== null) {
            var currentLatLng = new geography.LatLng(currentData.current.latitude, data.current.longitude);
            var newLatLng = new geography.LatLng(newData.current.latitude, newData.current.longitude);
            var distance = geography.computeDistanceBetween(currentLatLng, newLatLng);
            var newImg = google.staticImageUrl(newLatLng);
            if (currentData.current.img === defaultImage ||
                    currentData.current.img !== newImg &&
                    distance > 30) {
                newData.current.img = newImg;
                updateCurrentImageTime = currentTime;
                dom.byId('current_position_img').src = newData.current.img;
            }
        }

        //stored img
        if (currentTime - updateStoredImageTime > 5000 &&
                currentData.stored.img !== newData.stored.img) {
            updateStoredImageTime = currentTime;
            dom.byId('stored_position_img').src = newData.stored.img;
        }

        //current address
        if (currentData.current.address !== newData.current.address) {
            dom.byId('current_position_formatted_address').innerHTML = newData.current.address;
        }

        //stored address
        if (currentData.stored.address !== newData.stored.address) {
            dom.byId('stored_position_formatted_address').innerHTML = newData.stored.address;
        }

        //timestamp
        if (currentData.stored.timestamp !== newData.stored.timestamp) {
            dom.byId('stored_position_timestamp').innerHTML = timeago.inWords(newData.stored.timestamp);
        }

        //direction
        if (currentData.bearing !== newData.bearing ||
                currentData.distance !== newData.distance) {
            dom.byId('direction_current_to_stored').innerHTML = newData.distance + 'm ' + geography.computeCompassDirection(newData.bearing);
        }

        //radar
        if (currentData.bearing !== newData.bearing ||
                currentData.compass !== newData.compass ||
                currentData.distance !== newData.distance) {
            updateRadar(data.bearing, data.compass, newData.distance);
        }
        
        //compass
        if (currentData.bearing !== newData.bearing ||
                currentData.compass !== newData.compass) {
            updateCompass(data.bearing, data.compass);
        }
        
        currentData = newData;
    }
    
    return {
        'update': update
    };
});