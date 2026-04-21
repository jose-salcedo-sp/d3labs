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
  .attr("id", "ex8-chart-clip")
  .append("rect")
  .attr("width", innerWidth)
  .attr("height", innerHeight);

var plot = g.append("g")
  .attr("clip-path", "url(#ex8-chart-clip)");

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

var formattedData;
var currentIndex = 0;
var playTimer = null;
var playing = false;
var selectedContinent = "all";

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

function filterByContinent(countries) {
  if (!selectedContinent || selectedContinent === "all") {
    return countries;
  }
  return countries.filter(function (c) {
    return c.continent === selectedContinent;
  });
}

function formatIncome(n) {
  return d3.format(",.0f")(n);
}

function formatPop(n) {
  return d3.format(",")(n);
}

function showTooltip(d, year, pageX, pageY) {
  var html = "<strong>" + d.country + "</strong>" +
    "Continent: " + continentLabel(d.continent) + "<br/>" +
    "Year: " + year + "<br/>" +
    "Income: $" + formatIncome(d.income) + "<br/>" +
    "Life expectancy: " + d3.format(".1f")(d.life_exp) + " yrs<br/>" +
    "Population: " + formatPop(d.population);

  var $tip = $("#chart-tooltip");
  $tip.html(html).show();

  var pad = 14;
  var tw = $tip.outerWidth();
  var th = $tip.outerHeight();
  var left = pageX + pad;
  var top = pageY + pad;
  if (left + tw > window.innerWidth - 8) {
    left = pageX - tw - pad;
  }
  if (top + th > window.innerHeight - 8) {
    top = pageY - th - pad;
  }
  $tip.css({ left: left + "px", top: top + "px" });
}

function hideTooltip() {
  $("#chart-tooltip").hide().empty();
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

  var merged = enter.merge(circles);

  merged.transition()
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

  merged
    .style("cursor", "pointer")
    .on("mouseover", function (d) {
      var e = d3.event;
      showTooltip(d, year, e.pageX, e.pageY);
    })
    .on("mousemove", function (d) {
      var e = d3.event;
      showTooltip(d, year, e.pageX, e.pageY);
    })
    .on("mouseout", hideTooltip);
}

function indexOfYear1800OrFirst() {
  var idx = formattedData.findIndex(function (row) {
    return row.year === 1800;
  });
  return idx >= 0 ? idx : 0;
}

function syncSliderUi() {
  var max = Math.max(0, formattedData.length - 1);
  var $slider = $("#year-slider");
  $slider.attr("max", max);
  if (currentIndex > max) {
    currentIndex = max;
  }
  $slider.val(currentIndex);
  var yr = formattedData[currentIndex] ? formattedData[currentIndex].year : "";
  $("#year-slider-label").text(yr);
}

function renderCurrentFrame() {
  if (!formattedData || !formattedData.length) {
    return;
  }
  var row = formattedData[currentIndex];
  var list = filterByContinent(row.countries);
  updateFrame(list, row.year);
  syncSliderUi();
}

function stopPlayback() {
  playing = false;
  if (playTimer) {
    playTimer.stop();
    playTimer = null;
  }
  $("#btn-play-pause").text("Play");
}

function scheduleNextFrame() {
  if (!playing || !formattedData || !formattedData.length) {
    return;
  }
  playTimer = d3.timeout(function () {
    if (!playing) {
      return;
    }
    currentIndex = (currentIndex + 1) % formattedData.length;
    renderCurrentFrame();
    scheduleNextFrame();
  }, 1000);
}

function startPlayback() {
  if (playing || !formattedData || !formattedData.length) {
    return;
  }
  playing = true;
  $("#btn-play-pause").text("Pause");
  scheduleNextFrame();
}

function wireControls() {
  $("#btn-play-pause").on("click", function () {
    if (playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  $("#btn-reset").on("click", function () {
    currentIndex = indexOfYear1800OrFirst();
    renderCurrentFrame();
  });

  $("#year-slider").on("input", function () {
    currentIndex = +$(this).val();
    renderCurrentFrame();
  });

  $("#continent-filter").on("change", function () {
    selectedContinent = $(this).val();
    renderCurrentFrame();
  });

  $(window).on("scroll blur", hideTooltip);
}

function populateContinentSelect(continentDomain) {
  var $sel = $("#continent-filter");
  $sel.empty();
  $sel.append($("<option></option>").attr("value", "all").text("All continents"));
  continentDomain.forEach(function (c) {
    $sel.append($("<option></option>").attr("value", c).text(continentLabel(c)));
  });
  $sel.val("all");
}

d3.json("data/data.json").then(function (raw) {
  formattedData = formatYearData(raw);

  var continentDomain = collectContinents(formattedData);
  color = d3.scaleOrdinal()
    .domain(continentDomain)
    .range(d3.schemePastel1);

  buildLegend(continentDomain);
  populateContinentSelect(continentDomain);

  currentIndex = 0;
  wireControls();
  renderCurrentFrame();
  startPlayback();
}).catch(function (err) {
  console.log(err);
});
