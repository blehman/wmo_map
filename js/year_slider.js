function YearSlider(){

  var id = "year-slider";

  var height = 10
    , width = 500

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
    console.log(dates)
    var x = d3.scaleTime()
        .domain(d3.extent(dates))
        .range([0,width])

    slider.call(d3.axisBottom(x))

    slider.append("circle")
        .classed("dragger",true)
        .attr("r",20)
        .style("fill","red")
        .style("opacity",0.3)
        .call(d3.drag()
            .on("start",dragstarted)
            .on("drag", dragged)
            .on("end", dragended))

    function dragstarted(d) {
      d3.select(this).raise().classed("active", true);
    }

    function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x);
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
