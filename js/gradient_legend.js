function GradientLegend(){

  var id = "gradient-legend";

  var height = 7
    , width = 510;
  var stop_opacity = 0.60

  var domain;

  function chart(selection) {
    selection.each(function(data) {
      //console.log(data)
      var legend = d3.select(this)
          .attr("transform","translate(85,65)");

    // create some definitions
    var defs = legend.append("defs");
      /*
       RED
      #d73027
      #fc8d59
      #fee08b
      #d9ef8b
      #91cf60
      #1a9850
       Green
      */
    // define a linear gradient
    var linearGradient = defs.append("linearGradient")
          .attr("id","map-color-gradient")
          //.attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "100%").attr("y2", "0%")
          .selectAll("stop")
          .data([
            {offset: "0%", color: "#1a9850"},
            {offset: "16.67%", color: "#91cf60"},
            {offset: "33.33%", color: "#d9ef8b"},
            {offset: "50%", color: "#fee08b"},
            {offset: "66.67%", color: "#fc8d59"},
            {offset: "100%", color: "#d73027"}
          ])
         .enter().append("stop")
          .attr("offset", function(d) { return d.offset; })
          .attr("stop-color", function(d) { return d.color; })
          .attr("stop-opacity",stop_opacity);

      var legend_rect = legend.append("rect")
          .attr("x",0)
          .attr("y",0)
          .attr("width",width)
          .attr("height",height)
          .style("fill","url(#map-color-gradient)");

      // legend scale
      var x = d3.scaleLinear()
          .domain(d3.extent(domain))
          .range([0,width])

      var xAxis = legend.append("g")
          .attr("id","xAxis")
          .call(d3.axisBottom(x))


      // legend axis
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
  chart.stop_opacity = function(s) {
    if (!arguments.length) { return stop_opacity; }
    stop_opacity = s;
    return chart;
  };
  chart.domain = function(d) {
    if (!arguments.length) { return domain; }
    domain = d;
    return chart;
  };
// end GradientLegend
  return chart
}
