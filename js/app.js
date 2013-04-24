/*
    Josh Purvis - 2013 - BSD License
    http://github.com/joshpurvis/d3-weather
    http://joshpurvis.com/projects/d3-weather
*/

var weather = (function (parent, $) {
    var self = parent;

    /* preload the geocoder */
    self.geocoder = self.geocoder || new google.maps.Geocoder();

    /*
        NOTE: This is a proxy around the developer.forecast.io service, to circumvent cross origin protection.
        Please replace and proxy: http://api.forecast.io/forecast/<YOUR KEY>/<lat>,<lon>
    */
    self.apiPrefix = self.apiPrefix || 'http://joshpurvis.com/forecast/'

    self.init = function() {
        self.events();
        queue()
            .defer(d3.json, 'data/us.json')
            .await(self.ready);
    }

    self.events = function() {
        $('#btnSearch').on('click', function(e){
            self.search();
            e.preventDefault();
            return false;
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

    self.ready = function(error, us) {
        /* map variables */
        self.mapWidth = 480
        self.mapHeight = 250;

        /* weather chart variables */
        self.weatherMargin = {top: 20, right:20, bottom: 30, left: 50};
        self.weatherWidth = 960 - self.weatherMargin.left - self.weatherMargin.right;
        self.weatherHeight = 500 - self.weatherMargin.top - self.weatherMargin.bottom;

        /* create svg elements for map */
        self.projection = self.projection ||
            d3.geo.albersUsa()
                .scale(500)
                .translate([self.mapWidth / 2, self.mapHeight / 2]);

        self.path = self.path ||
            d3.geo.path()
                .projection(self.projection);

        self.svg = self.svg ||
            d3.select('#svgContainer').append("svg")
                .attr("width", self.mapWidth)
                .attr("height", self.mapHeight);

        self.group = self.group ||
            self.svg.append('g');

        /* draw state land areas */
        self.group.append("path")
            .attr("class", "states")
            .datum(topojson.object(us, us.objects.states))
            .attr("d", self.path)
            .on("click", function(d) {

            });

        /* draw county boundaries */
        self.group.append("path")
            .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
            .attr("class", "county-boundary")
            .attr("d", self.path);

        /* draw state boundaries */
        self.group.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "state-boundary")
            .attr("d", self.path);

        /* prepare the weather chart svg elements */
        self.weatherX = d3.time.scale()
            .range([0, self.weatherWidth]);

        self.weatherY = d3.scale.linear()
            .range([self.weatherHeight, 0]);

        self.weatherAxisX = function() {
            return d3.svg.axis()
                .scale(self.weatherX)
                .orient("bottom")
                .ticks(10);
        }

        self.weatherAxisY = function() {
            return d3.svg.axis()
            .scale(self.weatherY)
            .orient("left")
            .ticks(10);
        }

        self.weatherLine = d3.svg.line()
            .x(function(d) { return self.weatherX(d.date); })
            .y(function(d) { return self.weatherY(d.temperature); })
            .interpolate('linear');

    }

    self.draw = function(lat, lon) {

        /* draw the location marker on map */
        var coordProjection = self.projection([lon, lat]);
        self.marker = self.group.append('circle')
            .attr('cx', coordProjection[0])
            .attr('cy', coordProjection[1])
            .attr('r', 5)
            .attr('class', 'location-marker');

        /* create weather chart */
        self.drawWeather(lat, lon);

    }

    self.drawWeather = function(lat, lon) {

        self.weatherSvg = d3.select('#svgWeather')
            .attr("width", self.weatherWidth + self.weatherMargin.left + self.weatherMargin.right)
            .attr("height", self.weatherHeight + self.weatherMargin.top + self.weatherMargin.bottom);

        self.weatherSvg.selectAll('g').remove();

        self.weatherChart = self.weatherSvg
            .append("g")
                .attr("transform", "translate(" + self.weatherMargin.left + "," + self.weatherMargin.top + ")");

        d3.json(self.apiPrefix + lat + ',' + lon, function(e, response) {
            var data = response.hourly.data;

            data.forEach(function(d) {
                d.date = d.time * 1000;
            });

            self.weatherX.domain(d3.extent(data, function(d) { return d.date; }));
            self.weatherY.domain(d3.extent(data, function(d) { return d.temperature; }));

            /* add tick lines */
            self.weatherChart.append("g")
                    .attr("class", "grid")
                    .attr("transform", "translate(0," + self.weatherHeight + ")")
                    .call(self.weatherAxisX()
                        .tickSize(-self.weatherHeight, 0, 0)
                        .tickFormat("")
                    );

            self.weatherChart.append("g")
                .attr("class", "grid")
                .call(self.weatherAxisY()
                    .tickSize(-self.weatherWidth, 0, 0)
                    .tickFormat("")
                );

            /* add axes */
            self.weatherChart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + self.weatherHeight + ")")
                .call(self.weatherAxisX()
                );

            self.weatherChart.append("g")
                .attr("class", "y axis")
                .call(
                    self.weatherAxisY()
                )
                .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 20)
                    .style("text-anchor", "end")
                    .text("Temperature (F)");

            /* add title */
            self.weatherChart.append("text")
                    .attr("x", (self.weatherWidth / 2) + 30)
                    .attr("y", 0 - (self.weatherMargin.top / 2) + 30)
                    .attr("text-anchor", "middle")
                    .attr("class", "chart-title")
                    .text("48 Hour Forecast");

            /* draw line */
            var path = self.weatherChart.append("path")
                .datum(data)
                .attr("class", "line")
                .attr("d", self.weatherLine)
                .attr("fill", "none");

            /* animate the line */
            var totalPathLength = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", totalPathLength + " " + totalPathLength)
                .attr("stroke-dashoffset", totalPathLength)
                .transition()
                    .duration(1000)
                    .ease("linear")
                    .attr("stroke-dashoffset", 0);

        });
    }

    self.search = function() {
        /* geocode a fuzzy address/city/zip/etc value to USA based GPS coordinates */

        var value = $('#query').val();
        if (value === '') return;
        self.clear();

        self.geocoder.geocode({ 'address': value + ', United States'}, function(results, status) {

            if (status == google.maps.GeocoderStatus.OK) {
                var coordinates = results[0].geometry.location;
                var lon = coordinates.lng();
                var lat = coordinates.lat();
                self.draw(lat,lon);
            }
        });

    }

    self.clear = function() {
        /* remove location marker if exists */
        if (typeof(self.marker) != 'undefined') {
            self.marker.remove();
        }
    }

    return self;
}(weather || {}, jQuery));
