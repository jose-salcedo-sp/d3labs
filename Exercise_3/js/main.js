var svg = d3.select("#chart-area").append("svg")
  .attr("width", 400)
  .attr("height", 400)

d3.json("./data/ages.json").then(ages => ages.forEach(({ age }, i) => svg.append("circle")
  .attr("cx", 10 + 50 * i)
  .attr("cy", 250)
  .attr("r", age)
  .attr("fill", age > 10 ? "red" : "blue")
));


