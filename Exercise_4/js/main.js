var margin = { top: 50, right: 50, bottom: 50, left: 50 };
var innerWidth = 400;
var innerHeight = 400;

var svg = d3.select("#chart-area").append("svg")
  .attr("width", 500)
  .attr("height", 500);

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
    .range([0, innerHeight]);

  var color = d3.scaleOrdinal()
    .domain(names)
    .range(d3.schemeSet3);

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d.name);
    })
    .attr("y", function (d) {
      return innerHeight - y(+d.height);
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return y(+d.height);
    })
    .attr("fill", function (d) {
      return color(d.name);
    });
});
