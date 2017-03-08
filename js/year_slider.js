function YearSlider(){

  var id = "year-slider";

  var height = 10
    , width = 500

  var rectWidth = 30
    , rectHeight = 25;

  var years = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];

  var parseDate = d3.timeParse("%Y")
  var consumption_extent
    , choroplethScale;
  var filterYear;
  var title = "YEAR's Average Home Energy Consumption by WMO Region";

  var change;
  var previous_year = filterYear;

  function chart(selection) {
    selection.each(function(map_data) {

      var slider = d3.select(this)
          .attr("transform","translate(85,490)");

      var dates = years.map(d => parseDate(d));
      //console.log(dates)
      var xScale = d3.scaleTime()
          .domain(d3.extent(dates))
          .range([0,width]);

      var ticks = xScale.ticks(5);

      var xStart = xScale(parseDate(filterYear))-14;

      var xAxis = d3.axisBottom(xScale)
          .tickValues(ticks)

      slider.call(xAxis)

      slider.append("rect")
          .classed("dragger",true)
          .attr("x",xStart)
          .attr("y",-rectHeight)
          .attr("height",rectHeight)
          .attr("width",rectWidth)
          .style("fill","blue")
          .style("opacity",0.0)
          .call(d3.drag()
              .on("start",dragstarted)
              .on("drag", dragged)
              .on("end", dragended))

      slider.insert("circle",":first-child")
          .attr("id","slider_highlight")
          .attr("r",5)
          .attr("cx",xStart+15)
          .attr("cy",-11)
          .attr("width",0)
          //.style("opacity",0.0)

      slider.insert("image",":first-child")
          .attr("id","slider_img")
          .attr("xlink:href","img/slider.png")
          .attr("x",xStart)
          .attr("y",-15)
          .attr("opacity",1)
          .attr("width","30px")

      slider.append("text")
          .attr("id","chart-title")
          .classed("slider text",true)
          .attr("x",-28)
          .attr("y",-460)
          .text(title.replace("YEAR",filterYear));

      function dragstarted(d) {
        d3.select("#slider_highlight").raise().classed("active", true);
      }

      function dragged(d) {
        var x_value = d3.max([0, d3.min([d3.event.x,width - rectWidth])]);
        d3.select(this).attr("x", d.x = x_value);
        d3.selectAll("#slider_img").attr("x", x_value);
        d3.selectAll("#slider_highlight").attr("cx", 15 + x_value);
        var year = xScale.invert(x_value).getFullYear();
        var rounded_year = Math.round(year/10)*10;
        d3.select("#chart-title")
          .text(title.replace("YEAR",rounded_year));
        if (previous_year != rounded_year){
          change.call("year_change",this,rounded_year)
          previous_year = rounded_year;
        }
      }

      function dragended(d) {
        d3.select("#slider_highlight").classed("active", false);
      }

    //end selection
    })
  // end chart
  }
  chart.id = function(i) {
    if (!arguments.length) { return id; }
    id = i;
    return chart;
  };
  chart.width = function(w) {
    if (!arguments.length) { return width; }
    width = w;
    return chart;
  };
  chart.height = function(h) {
    if (!arguments.length) { return height; }
    height = h;
    return chart;
  };
  chart.consumption_extent = function(c) {
    if (!arguments.length) { return consumption_extent; }
    consumption_extent = c;
    return chart;
  };
  chart.choroplethScale= function(c) {
    if (!arguments.length) { return choroplethScale; }
    choroplethScale = c;
    return chart;
  };
  chart.years = function(y) {
    if (!arguments.length) { return years; }
    years = y;
    return chart;
  };
  chart.filterYear = function(y) {
    if (!arguments.length) { return filterYear; }
    filterYear = y;
    return chart;
  };
  chart.change = function(c) {
    if (!arguments.length) { return change; }
    change = c;
    return chart;
  };
  // end YearSlider
  return chart
}
