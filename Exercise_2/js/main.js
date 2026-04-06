let data = [25, 20, 15, 10, 5];

const svg = d3.select("#chart-area").append("svg")
  .attr("width", 400)
  .attr("height", 400);

data.forEach((height, i) => svg.append("rect")
  .attr("height", height)
  .attr("width", 40)
  .attr("y", 400 - height)
  .attr("x", i * 45 + 5)
);
