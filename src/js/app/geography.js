define(function (require) {
    'use strict';

    var geometry = require('./geometry');

    var toRad = geometry.toRad;
    var toDeg = geometry.toDeg;

    function LatLng(latitude, longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
    LatLng.prototype = {
        lat: function () {
            return this.latitude;
        },
        lng: function () {
            return this.longitude;
        },
        toUrlValue: function (precision) {
            if (typeof precision === 'undefined') {
                precision = 6;
            }
            return this.latitude.toFixed(precision) + ',' +
                this.longitude.toFixed(precision);
        }
    };

    /**
     * Returns the distance between two points in m
     * (using Haversine formula)
     *
     * from: Haversine formula - R. W. Sinnott, "Virtues of the Haversine",
     *       Sky and Telescope, vol 68, no 2, 1984
     *
     * @param {LatLng} from
     * @param {LatLng} to
     * @param {number=} radius
     * @return {string} distance in meters
     */
    function computeDistanceBetween(from, to, radius) {
        // earth radius  as used in gps systems (WGS-84)
        if (typeof radius === 'undefined') {
            radius = 6378137;
        }

        var lat1 = toRad(from.lat());
        var lon1 = toRad(from.lng());
        var lat2 = toRad(to.lat());
        var lon2 = toRad(to.lng());

        var dLat = lat2 - lat1;
        var dLon = lon2 - lon1;

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = radius * c;

        return d.toFixed(1);
    }

    /**
     * Returns the (initial) bearing from this point to the supplied point, in degrees
     *   see http://williams.best.vwh.net/avform.htm#Crs
     *
     * @param {LatLng} from
     * @param {LatLng} to
     * @return {number} heading in degrees
     */
    function computeHeading(from, to) {
        var lat1 = toRad(from.lat());
        var lon1 = toRad(from.lng());
        var lat2 = toRad(to.lat());
        var lon2 = toRad(to.lng());

        var dLon = lon2 - lon1;

        var y = Math.sin(dLon) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        var brng = Math.atan2(y, x);

        return (toDeg(brng) + 360) % 360;
    }

    function computeCompassDirection(angle) {
        var directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
        return directions[Math.floor(((angle + 22.5) % 360) / 45)];
    }

    return {
        LatLng: LatLng,
        computeDistanceBetween: computeDistanceBetween,
        computeHeading: computeHeading,
        computeCompassDirection: computeCompassDirection
    };

});
