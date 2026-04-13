var svg = d3.select("#chart-area").append("svg")
  .attr("width", 400)
  .attr("height", 400)
  .attr("style", "background-color: green");

var circle = svg.append("circle")
  .attr("cx", 100)
  .attr("cy", 250)
  .attr("r", 70)
  .attr("fill", "blue");

var rect = svg.append("rect")
  .attr("x", 80)
  .attr("y", 20)
  .attr("width", 50)
  .attr("height", 50)
  .attr("fill", "red");
