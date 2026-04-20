var margin = { top: 40, right: 40, bottom: 70, left: 80 };
var width = 800;
var height = 480;
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var money = d3.format("$,.0f");

d3.json("data/revenues.json").then(function (data) {
  data.forEach(function (d) {
    d.revenue = +d.revenue;
    d.profit = +d.profit;
  });

  var months = data.map(function (d) {
    return d.month;
  });

  var x = d3.scalePoint()
    .domain(months)
    .range([0, innerWidth])
    .padding(0.5);

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {
      return d.revenue;
    }) * 1.08])
    .nice()
    .range([innerHeight, 0]);

  var line = d3.line()
    .x(function (d) {
      return x(d.month);
    })
    .y(function (d) {
      return y(d.revenue);
    });

  var gridG = g.append("g")
    .attr("class", "grid")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickSize(-innerWidth)
        .tickFormat("")
    );

  gridG.select(".domain").remove();
  gridG.selectAll("text").remove();
  gridG.selectAll("line")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "2,2");

  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#1f77b4")
    .attr("stroke-width", 2.5)
    .attr("d", line);

  g.selectAll("circle.revenue")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "revenue")
    .attr("cx", function (d) {
      return x(d.month);
    })
    .attr("cy", function (d) {
      return y(d.revenue);
    })
    .attr("r", 5)
    .attr("fill", "#1f77b4")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("class", "axis axis--y")
    .call(
      d3.axisLeft(y)
        .ticks(8)
        .tickFormat(function (d) {
          return money(d);
        })
    );

  g.append("text")
    .attr("class", "axis-label axis-label--x")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 55)
    .attr("text-anchor", "middle")
    .text("Month");

  g.append("text")
    .attr("class", "axis-label axis-label--y")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -58)
    .attr("text-anchor", "middle")
    .text("Revenue (USD)");

  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", 24)
    .attr("text-anchor", "middle")
    .text("Monthly revenue (January–July)");
});
