/*
 *    main.js — Leaf / Gapminder-style income vs life expectancy
 */

var margin = { top: 50, right: 140, bottom: 70, left: 80 };
var outerWidth = 960;
var outerHeight = 640;
var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

var g = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

g.insert("defs", ":first-child")
  .append("clipPath")
  .attr("id", "leaf-chart-clip")
  .append("rect")
  .attr("width", innerWidth)
  .attr("height", innerHeight);

var plot = g.append("g")
  .attr("clip-path", "url(#leaf-chart-clip)");

var x = d3.scaleLog()
  .domain([142, 150000])
  .range([0, innerWidth])
  .clamp(true);

var y = d3.scaleLinear()
  .domain([0, 90])
  .range([innerHeight, 0]);

var popArea = d3.scaleLinear()
  .domain([2000, 1400000000])
  .range([25 * Math.PI, 1500 * Math.PI])
  .clamp(true);

var xAxisGroup = g.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + innerHeight + ")");

var yAxisGroup = g.append("g")
  .attr("class", "axis axis--y");

var xAxis = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(function (d) {
    return "$" + d;
  });

var yAxis = d3.axisLeft(y);

xAxisGroup.call(xAxis);
yAxisGroup.call(yAxis);

g.append("text")
  .attr("class", "axis-label axis-label--x")
  .attr("x", innerWidth / 2)
  .attr("y", innerHeight + 52)
  .attr("text-anchor", "middle")
  .text("Income (GDP per capita, inflation-adjusted $)");

g.append("text")
  .attr("class", "axis-label axis-label--y")
  .attr("transform", "rotate(-90)")
  .attr("x", -innerHeight / 2)
  .attr("y", -58)
  .attr("text-anchor", "middle")
  .text("Life expectancy (years)");

var yearLabel = g.append("text")
  .attr("class", "year-label")
  .attr("x", innerWidth - 8)
  .attr("y", 42)
  .attr("text-anchor", "end")
  .text("");

var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (margin.left + innerWidth + 12) + "," + (margin.top + 20) + ")");

legend.append("text")
  .attr("class", "legend-title")
  .attr("x", 0)
  .attr("y", 0)
  .text("Continent");

var color;

var yearIndex = 0;
var formattedData;

function continentLabel(c) {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function formatYearData(rawYears) {
  return rawYears.map(function (yearObj) {
    var yr = +yearObj.year;
    var countries = yearObj.countries.filter(function (country) {
      var ok = country.income != null && country.life_exp != null && country.population != null;
      return ok && +country.income > 0;
    }).map(function (country) {
      return {
        continent: country.continent,
        country: country.country,
        income: +country.income,
        life_exp: +country.life_exp,
        population: +country.population
      };
    });
    return { year: yr, countries: countries };
  }).sort(function (a, b) {
    return a.year - b.year;
  });
}

function collectContinents(rows) {
  var set = {};
  rows.forEach(function (row) {
    row.countries.forEach(function (c) {
      set[c.continent] = true;
    });
  });
  return Object.keys(set).sort();
}

function buildLegend(continentDomain) {
  legend.selectAll("g.legend-row").remove();

  var rows = legend.selectAll("g.legend-row")
    .data(continentDomain)
    .enter()
    .append("g")
    .attr("class", "legend-row")
    .attr("transform", function (d, i) {
      return "translate(0," + (18 + i * 22) + ")";
    });

  rows.append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("rx", 2)
    .attr("ry", 2)
    .attr("fill", function (d) {
      return color(d);
    })
    .attr("stroke", "#888");

  rows.append("text")
    .attr("x", 20)
    .attr("y", 11)
    .attr("class", "legend-text")
    .text(function (d) {
      return continentLabel(d);
    });
}

function radiusForPopulation(pop) {
  return Math.sqrt(popArea(pop) / Math.PI);
}

function updateFrame(countries, year) {
  yearLabel.text(String(year));

  var circles = plot.selectAll("circle").data(countries, function (d) {
    return d.country;
  });

  circles.exit()
    .transition()
    .duration(400)
    .attr("r", 0)
    .remove();

  var enter = circles.enter().append("circle")
    .attr("fill", function (d) {
      return color(d.continent);
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.4)
    .attr("opacity", 0.88)
    .attr("cx", function (d) {
      return x(d.income);
    })
    .attr("cy", function (d) {
      return y(d.life_exp);
    })
    .attr("r", 0);

  enter.merge(circles)
    .transition()
    .duration(900)
    .ease(d3.easeCubicInOut)
    .attr("cx", function (d) {
      return x(d.income);
    })
    .attr("cy", function (d) {
      return y(d.life_exp);
    })
    .attr("r", function (d) {
      return radiusForPopulation(d.population);
    })
    .attr("fill", function (d) {
      return color(d.continent);
    });
}

function tick() {
  if (!formattedData || !formattedData.length) {
    return;
  }
  var row = formattedData[yearIndex];
  updateFrame(row.countries, row.year);
  yearIndex = (yearIndex + 1) % formattedData.length;
}

d3.json("data/data.json").then(function (raw) {
  formattedData = formatYearData(raw);

  var continentDomain = collectContinents(formattedData);
  color = d3.scaleOrdinal()
    .domain(continentDomain)
    .range(d3.schemePastel1);

  buildLegend(continentDomain);

  d3.interval(tick, 1000);
  tick();
}).catch(function (err) {
  console.log(err);
});
