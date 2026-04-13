var svg = d3.select("#chart-area").append("svg")
  .attr("width", 1000)
  .attr("height", 400)

d3.json("./data/ages.json").then(ages => ages.forEach(({ age }, i) => svg.append("circle")
  .attr("cx", 10 + 50 * i)
  .attr("cy", 100)
  .attr("r", age)
  .attr("fill", age > 10 ? "red" : "blue")
));

d3.json("./data/buildings.json").then(buildings => buildings.forEach(({ height }, i) => svg.append("rect")
  .attr("x", 0)
  .attr("y", 200 + 20 * i)
  .attr("width", height)
  .attr("height", 20)
  .attr("fill", i % 2 === 0 ? "red" : "blue")
));
