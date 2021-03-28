//set up square size and margin
let margin = {
  top: 50,
  right: 100,
  bottom: 300,
  left: 100 };

let rectWidth = 8;
let rectHeight = 30;
let swatchSize = 30;
let swatchPadding = 3;

//set up json data url
let url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

//set up tooltip
let tooltip = d3.
select("body").
append("div").
attr("class", "tooltip").
attr("id", "tooltip").
style("position", "absolute").
style("opacity", 0);

//fetch data and display data
fetch(url).
then(response => response.json()).
then(data => {

  let width = rectWidth * data.monthlyVariance.length / 12;
  let height = rectHeight * 12;

  //set up heading and svg
  let heading = d3.select("body").append("heading");

  heading.append("h1").
  attr("id", "title").
  text("Monthly Global Land-Surface Temperature");

  heading.append("h2").
  attr("id", "description").
  html(
  d3.min(data.monthlyVariance, d => d.year) + "-" +
  d3.max(data.monthlyVariance, d => d.year) + ": base temperature " +
  data.baseTemperature + "&#8451;");


  const svg = d3.
  select("body").
  append("svg").
  attr("id", "heatmap").
  attr("width", width + margin.left + margin.right).
  attr("height", height + margin.top + margin.bottom);


  //color scale
  let sequentialScale = d3.scaleSequential().
  domain(d3.extent(data.monthlyVariance, d => d.variance)).
  interpolator(d3.interpolatePlasma);


  //set up xScale, yScale, xAxis, yAxis
  let xScale = d3.
  scaleBand().
  domain(data.monthlyVariance.map(d => d.year)).
  range([0, width]);
  let yScale = d3.
  scaleBand().
  domain(data.monthlyVariance.map(d => d.month)).
  range([0, height]);

  let xAxis = d3.
  axisBottom(xScale).
  tickValues(xScale.domain().filter(year => year % 10 == 0)).
  tickFormat(d3.format("d")).
  tickSizeOuter(0);
  let yAxis = d3.
  axisLeft(yScale).
  tickSize(0).
  tickValues(data.monthlyVariance.month).
  tickFormat(d => {
    let parser = d3.timeParse("%m");
    return d3.timeFormat("%B")(parser(d));
  });

  svg.append("g").
  call(xAxis).
  attr("id", "x-axis").
  attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")").
  append('text').
  text('Years').
  style('text-anchor', 'middle').
  attr("transform", "translate(15,15)");

  svg.append("g").
  call(yAxis).
  attr("id", "y-axis").
  attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text").
  attr("id", "x-label").
  attr("text-anchor", "start").
  attr("alignment-baseline", "hanging").
  attr("x", width / 4).
  attr("y", margin.top + height + 50).
  text("Years");

  svg.append("text").
  attr("id", "y-label").
  attr("transform", "rotate(-90)").
  attr("text-anchor", "middle").
  attr("x", 0 - (margin.top + height) / 2).
  attr("y", margin.left / 3).
  text("Months");


  //put the rect in
  svg.selectAll("rect").
  data(data.monthlyVariance).
  enter().
  append("rect").
  attr("class", "cell").
  attr("data-month", d => d.month - 1).
  attr("data-year", d => d.year).
  attr("data-temp", d => data.baseTemperature + d.variance).
  attr("width", rectWidth).
  attr("height", rectHeight).
  attr("x", (d, i) => xScale(d.year)).
  attr("y", d => yScale(d.month)).
  attr("fill", d => sequentialScale(d.variance * 2)).
  attr("opacity", 0.8).
  attr("transform", "translate(" + margin.left + "," + margin.top + ")").
  on("mouseover", (event, d) => {
    let date = new Date(d.year, d.month);
    tooltip.transition().
    duration(200).
    style("opacity", 0.9).
    attr("data-year", d.year);
    tooltip.html(
    d3.timeFormat('%Y - %B')(date) + "<br/>" +
    d.variance + "&#8451;").
    style("left", event.pageX + "px").
    style("top", event.pageY + "px");

  }).
  on("mouseout", d => {
    tooltip.transition().
    duration(500).
    style("opacity", 0);
  });


  //legend
  let legendLength = 10;

  let legendArray = sequentialScale.domain();

  let interval = (legendArray[legendArray.length - 1] - legendArray[0]) / (legendLength - 1);
  for (let i = 1; i < legendLength - 1; i++) {
    let number = i * interval;
    legendArray.splice(-1, 0, legendArray[0] + number);
  }

  let colorScale = d3.
  scaleLinear().
  domain(sequentialScale.domain()).
  range([margin.left, (swatchSize - 0.5) * legendLength + margin.left, swatchSize * (legendLength + 1) + margin.left - 2]);

  let cAxis = d3.axisBottom(colorScale).
  tickValues([...legendArray, legendArray[legendArray.length - 1] + interval]).
  tickFormat(d3.format(".2f"));

  let legend = svg.
  append("g").
  attr("class", "legend").
  attr("id", "legend").
  attr("x", margin.left).
  attr("y", margin.top + height + 100);

  legend.append("g").
  call(cAxis).
  attr("id", "c-axis").
  attr("transform", "translate(0," + (height + margin.top + swatchSize + 100) + ")");

  legend.selectAll("rect").
  data(legendArray).
  enter().
  append("rect").
  attr("class", "legend-swatch").
  attr("x", (d, i) => margin.left + i * (swatchSize + swatchPadding)).
  attr("y", margin.top + height + 100).
  attr("width", swatchSize).
  attr("height", swatchSize).
  attr("fill", sequentialScale).
  attr("opacity", 0.8);


});