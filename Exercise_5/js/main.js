var margin = { top: 10, right: 10, bottom: 100, left: 100 };
var width = 600;
var height = 400;

var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/buildings.json").then(function (data) {
  var names = data.map(function (d) {
    return d.name;
  });

  var x = d3.scaleBand()
    .domain(names)
    .range([0, innerWidth])
    .paddingInner(0.3)
    .paddingOuter(0.3);

  var y = d3.scaleLinear()
    .domain([0, 828])
    .range([innerHeight, 0]);

  var color = d3.scaleOrdinal()
    .domain(names)
    .range(d3.schemeSet3);

  var rects = g.selectAll("rect").data(data);

  rects.enter()
    .append("rect")
    .attr("y", function (d) {
      return y(+d.height);
    })
    .attr("x", function (d) {
      return x(d.name);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return innerHeight - y(+d.height);
    })
    .attr("fill", function (d) {
      return color(d.name);
    });

  var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(d3.axisBottom(x));

  xAxisGroup.selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("x", -5)
    .attr("y", 10)
    .style("text-anchor", "end");

  g.append("g")
    .attr("class", "y axis")
    .call(
      d3.axisLeft(y)
        .ticks(5)
        .tickFormat(function (d) {
          return d + " m";
        })
    );

  svg.append("text")
    .attr("class", "x axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .text("The world's tallest buildings");

  g.append("text")
    .attr("class", "y axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("text-anchor", "middle")
    .text("Height (m)");
});
