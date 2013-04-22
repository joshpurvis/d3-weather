
var w = 400,
    h = 100,
    barPadding = 1,
    dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

var defaultWidth = w / dataset.length - barPadding;

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

svg.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .on("mouseover", function(d){
        d3.select(this).style("opacity", "1")
    })
    .on("mouseout", function(d){
        d3.select(this).style("opacity", ".5")
    })
    .attr('x', 0)
    .attr('y', 0)
    .style("opacity", ".5")

    .transition()
        .duration(500)

    .attr("x", function(d, i) {
        return i * (w / dataset.length);
    })
    .attr("y", function(d) {
        return h - (d * 4);
    })
    .attr("width", defaultWidth)
    .attr("height", function(d) {
        return d * 4;
    })
    .attr("fill", function(d) {
        return "rgb(0, 0, " + (d * 10) + ")";
    });

svg.selectAll("text")
    .data(dataset)
    .enter()
    .append("text")
    .text(function(d) {
        return d;
    })
    .attr("font-family", "sans-serif")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .attr("fill", "#000")
    .attr("text-anchor", "middle")
    .attr('x', 0)
    .attr('y', 0)

    .transition()
        .delay(100)
        .duration(1000)

    .attr("fill", "#fff")
    .attr("x", function(d, i) {
        return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
    })
    .attr("y", function(d) {
        return h - (d * 4) + 14;
    });

