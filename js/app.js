/*
    Josh Purvis - 2013 - BSD License
    http://joshpurvis.com/projects/d3-weather
*/

var weather = (function (parent, $) {
    var self = parent;

    self.init = function() {
        self.events();
        queue()
            .defer(d3.json, '/data/us.json')
            .await(self.ready);
    }

    self.events = function() {
        $('#btnSearch').on('click', function(e){
            self.search();
            e.preventDefault();
        });

        $('input').on('keyup', function(e) {
            var code = e.keyCode || e.which;
            if (code == 13) {
                self.search();
                e.preventDefault();
                return false;
            }
        });
    }

    self.draw = function(lat, lon) {

        /* draw the location marker on map */
        var coordProjection = self.projection([lat, lon]);
        self.marker = self.group.append('circle')
            .attr('cx', coordProjection[0])
            .attr('cy', coordProjection[1])
            .attr('r', 5)
            .attr('class', 'symbol');

        /* create weather chart */
        // ...

    }

    self.ready = function(error, us) {
        var width = 480,
            height = 250;

        self.projection = self.projection ||
            d3.geo.albersUsa()
                .scale(500)
                .translate([width / 2, height / 2]);

        self.path = self.path ||
            d3.geo.path()
                .projection(self.projection);

        self.svg = self.svg ||
            d3.select('#svgContainer').append("svg")
                .attr("width", width)
                .attr("height", height);

        self.group = self.group ||
            self.svg.append('g');


        self.group.append("path")
            .attr("class", "states")
            .datum(topojson.object(us, us.objects.states))
            .attr("d", self.path)
            .on("click", function(d) {

            });

        self.group.append("path")
            .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
            .attr("class", "county-boundary")
            .attr("d", self.path);

        self.group.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "state-boundary")
            .attr("d", self.path);

    }

    self.search = function() {
        /* geocode a fuzzy address/city/zip/etc value to USA based GPS coordinates */

        var value = $('#query').val();
        if (value === '') return;

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': value + ', United States'}, function(results, status) {
            self.clear();
            if (status == google.maps.GeocoderStatus.OK) {
                var coordinates = results[0].geometry.location;
                var lat = coordinates.kb;
                var lon = coordinates.jb;
                self.draw(lat,lon);
            }
        });

    }

    self.clear = function() {
        /* remove location marker if exists */
        if (typeof(self.marker) != 'undefined') {
            self.marker.remove();
        }

        /* remove chart */
    }

    return self;
}(weather || {}, jQuery));
