function YearSlider(){

  var id = "year-slider";

  var height = 10
    , width = 350

  var rectWidth = 30
    , rectHeight = 25;

  //var years = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];
  var years = [1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];

  var parseDate = d3.timeParse("%Y")
  var consumption_extent
    , choroplethScale;
  var filterYear;
  //var title = "Year-End Energy Consumption & Feature Efficiency Ratings for a YEAR's Home | by Weather Region".split("|");
  var title = "50 Years of Consumption & Efficiency"
  var slider_heading_title = "Home Vintage: YEAR";

  var change;
  var previous_year = filterYear;

  function chart(selection) {
    selection.each(function(map_data) {
      var slider = d3.select(this)
          .attr("transform","translate("+((795/2)-100-85)+",520)");
      var dates = years.map(d => parseDate(d));
      var date_range = d3.extent(dates);
      // create axis
      var xScale = d3.scaleTime()
          .domain([parseDate("1946"),parseDate("2004")])
          .range([0,width]);

      var ticks = xScale.ticks(1);

      var xStart = xScale(parseDate(filterYear))-14;

      var xAxis = d3.axisBottom(xScale)
          .tickValues(ticks)

      slider.call(xAxis)
      // create some definitions
      var defs = slider.append("defs");
      // create right arrow marker
      defs.append("marker")
        .attr("id", "slider_arrow_right")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
       .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("stroke-width","2px")
        .style("fill",d3.rgb(255, 255, 255))
        .style("stroke",d3.rgb(255, 255, 255))
        // create right arrow
      slider.append("line")// attach a line
        .attr("id","arrow_right")
        .style("opacity",1)
        .style("fill","black")
        .style("stroke", "black")
        .attr("x1", xScale(parseDate(filterYear))+13.2)
        .attr("y1", -11.3)
        .attr("x2", xScale(parseDate(filterYear))+14.3)
        .attr("y2", -11.3)
        .attr("marker-end","url(#slider_arrow_right)");
      // create left arrow marker
      defs.append("marker")
        .attr("id", "slider_arrow_left")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
       .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill","black")
        .attr("stroke","black")
        .style("fill",d3.rgb(255, 255, 255))
        .style("stroke",d3.rgb(255, 255, 255))       // create arrow
      slider.append("line")// attach a line
        .attr("id","arrow_left")
        .style("opacity",1)
        .style("fill","black")
        .style("stroke", "black")
        .attr("x1", xScale(parseDate(filterYear))-11.5)
        .attr("y1", -11.3)
        .attr("x2", xScale(parseDate(filterYear))-12.5)
        .attr("y2", -11.3)
        .attr("marker-end","url(#slider_arrow_left)");
      // create rect for dragging
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
      // create small inner circle.
      slider.insert("circle",":first-child")
          .attr("id","slider_highlight")
          .attr("fill",d3.rgb(255, 255, 255))
          .attr("stroke","black")
          .attr("stroke-width",1)
          .attr("r",5)
          .attr("cx",xStart+15)
          .attr("cy",-11);
      // create larger outer circle
      slider.insert("circle",":first-child")
          .attr("id","slider_bug")
          .attr("r",9)
          .attr("cx",xStart+15)
          .attr("cy",-11);

      slider.insert("circle",":first-child")
          .attr("id","slider_bug_background")
          .attr("r",9)
          .attr("cx",xStart+15)
          .attr("cy",-11);
      // insert image (doesn't seem to work in some browsers)
      /*
      slider.insert("image",":first-child")
          .attr("id","slider_img")
          .attr("xlink:href","img/slider.png")
          .attr("x",xStart)
          .attr("y",-15)
          .attr("opacity",1)
          .attr("width","30px")
      */
      // create main title
      slider.append("text")
          .attr("id","chart-title")
          .attr("x",0)
          .attr("y",-580)
          .text(title);
          //.text(title.replace("YEAR",filterYear));
/*
      // create sub title
      slider.append("text")
          .attr("id","chart-title")
          .classed("slider text",true)
          .attr("x",440)
          .attr("y",-460)
          .text(title[1]);
*/
      slider.append("text")
          .attr("id","slider-heading")
          .classed("heading",true)
          .attr("x",58)
          .attr("y",-35)
          .text(slider_heading_title.replace("YEAR",filterYear));
      // label slider
/*
      slider.append("text")
          .attr("id","ball-label")
          .classed("slider text",true)
          .attr("x",xScale(parseDate(filterYear))+1)
          .attr("y",-23)
          .text("Choose Vintage");
*/
      function dragstarted(d) {
        d3.select("#slider_highlight").classed("active", true);
      }

      function dragged(d) {
        var x_value = d3.max([0, d3.min([d3.event.x,width - rectWidth])]);
        // change value of invisible slider rect
        d3.select(this).attr("x", d.x = x_value);
        // change xValue of slider image
        d3.selectAll("#slider_img").attr("x", x_value);
        // change xValue of slider label
        d3.selectAll("#ball-label").attr("x", x_value+16);
        // change xValue of circle behind image
        d3.selectAll("#slider_highlight").attr("cx", 15 + x_value);
        // change xValue of large center circle
        d3.selectAll("#slider_bug").attr("cx", 15 + x_value);
        d3.selectAll("#slider_bug_background").attr("cx", 15 + x_value);
        // change slider arrows
        d3.select("#arrow_right")
          .attr("x1", x_value+27)
          .attr("x2", x_value+28)
        d3.select("#arrow_left")
          .attr("x1", x_value+3)
          .attr("x2", x_value+2)
        // change title
        var year = xScale.invert(x_value).getFullYear();
        var rounded_year = Math.round(year/10)*10;
        //var rounded_year = (year>2000)? 2000:Math.round(year/10)*10;
        d3.select("#slider-heading")
          .text(slider_heading_title.replace("YEAR",rounded_year));
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
