/*
    Josh Purvis - 2013 - BSD License
    http://joshpurvis.com/projects/d3-weather
*/

var width = 480,
    height = 250;

var projection = d3.geo.albersUsa()
    .scale(500)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select('#svgContainer').append("svg")
    .attr("width", width)
    .attr("height", height);

var group = svg.append('g');

queue()
    .defer(d3.json, '/data/us.json')
    .await(ready);

function ready(error, us, centroid) {

    group.append("path")
        .attr("class", "states")
        .datum(topojson.object(us, us.objects.states))
        .attr("d", path)
        .on("click", function(d) {

        });

    group.append("path", ".graticule")
        .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
        .attr("class", "county-boundary")
        .attr("d", path);

    group.append("path", ".graticule")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "state-boundary")
        .attr("d", path);

    var coords = projection(['-154.493', '63.5912']);

    group.append('circle')
        .attr('cx', coords[0])
        .attr('cy', coords[1])
        .attr('r', 5)
        .attr('class', 'symbol');

}

