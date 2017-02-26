function YearSlider(){

  var id = "year-slider";

  var height = 10
    , width = 500

  var rectWidth = 30
    , rectHeight = 25;

  var years = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010];

  var parseDate = d3.timeParse("%Y")
  var consumption_extent,
      choroplethScale;

  function chart(selection) {
    selection.each(function(map_data) {
      //console.log(map_data)
    var slider = d3.select(this)
        .append("g")
        .attr("id","yearSlider")
        .attr("transform","translate(85,450)");

    var dates = years.map(d => parseDate(d));
    //console.log(dates)
    var x = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([0,width])
    var ticks = x.ticks(5);
    console.log(ticks)
    var xAxis = d3.axisBottom(x)
        .tickValues(ticks)

    slider.call(xAxis)

    slider.append("rect")
        .classed("dragger",true)
        //.attr("x",xPos)
        .attr("y",-rectHeight)
        .attr("height",rectHeight)
        .attr("width",rectWidth)
        .style("fill","blue")
        .style("opacity",0.0)
        .call(d3.drag()
            .on("start",dragstarted)
            .on("drag", dragged)
            .on("end", dragended))


    slider.insert("image",":first-child")
        .attr("id","slider_img")
        .attr("xlink:href","img/slider.png")
        .attr("x",0)
        .attr("y",-15)
        .attr("opacity",0.90)
        .attr("width","30px")
    function dragstarted(d) {
      d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
      d3.select(this).attr("x", d.x = d3.max([0, d3.min([d3.event.x,width - rectWidth])]));
      d3.selectAll("#slider_img").attr("x", d3.max([0, d3.min([d3.event.x,width - rectWidth])]));
      var year = x.invert(d3.event.x).getFullYear()
      console.log(Math.round(year/10)*10)
    }

    function dragended(d) {
      d3.select(this).classed("active", false);
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
// end NewMap
  return chart
}
