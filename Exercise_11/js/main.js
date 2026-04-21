/*
*    main.js
*/

var margin ={top: 20, right: 300, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
    

var svg = d3.select("#chart-area").append("svg")
	.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
    	"," + margin.top + ")");

// Time parser for x-scale
var parseDate = d3.timeParse('%Y');
var formatSi = d3.format(".3s");
var formatNumber = d3.format(".1f"),
formatBillion = (x) => { return formatNumber(x / 1e9); };

// Scales
var x = d3.scaleTime().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal(d3.schemeSpectral[11]);

// Axis generators
var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft().tickFormat(formatBillion);

// Area generator — each stacked point d has [y0, y1] and d.data is the source row
var area = d3.area()
    .x((d) => { return x(d.data.date); })
    .y0((d) => { return y(d[0]); })
    .y1((d) => { return y(d[1]); });

// Stack generator (keys assigned after CSV load)
var stack = d3.stack()
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

// Axis groups
var xAxis = g.append("g")
	.attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxis =  g.append("g")
	.attr("class", "y axis");
        
// Y-Axis label
yAxis.append("text")
	.attr("class", "axis-title")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("text-anchor", "end")
    .text("Billions of liters");

// Legend code
var legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width + 12) + ",0)");

d3.csv('data/stacked_area2.csv').then((data) => {

    var keys = d3.keys(data[0]).filter((key) => {
        return key !== "date";
    });
    color.domain(keys);

    data.forEach((d) => {
        d.date = parseDate(d.date);
        keys.forEach((key) => {
            d[key] = +d[key];
        });
    });

    var maxDateVal = d3.max(data, (d) => {
        return d3.sum(keys.map((key) => { return d[key]; }));
    });

    x.domain(d3.extent(data, (d) => { return d.date; }));
    y.domain([0, maxDateVal]);

    // Generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    stack.keys(keys);
    var series = stack(data);

    var layers = g.insert("g", ".x.axis")
        .attr("class", "stacked-areas");

    layers.selectAll("path")
        .data(series)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("fill", (d) => { return color(d.key); })
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.35)
        .attr("d", area);

    var legendRows = legend.selectAll("g.legend-row")
        .data(keys)
        .enter()
        .append("g")
        .attr("class", "legend-row")
        .attr("transform", (d, i) => {
            return "translate(0," + (i * 22) + ")";
        });

    legendRows.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("fill", (d) => { return color(d); });

    legendRows.append("text")
        .attr("x", 22)
        .attr("y", 8)
        .attr("dy", "0.35em")
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .text((d) => { return d; });

}).catch((error) => {
    console.log(error);
});