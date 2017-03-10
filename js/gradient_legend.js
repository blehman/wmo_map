function GradientLegend(){

  var id = "gradient-legend";

  var height = 7
    , width = 510;
  var stop_opacity = 0.60

  var choroplethScale
    , consumption_extent
    , units = 'KWH'
    , dispatch_updateLegendScale = d3.dispatch("updateLegendScale")
    , filterYear="1980";

  function chart(selection) {
    selection.each(function(data) {
      var wmoVintage2energy = data["wmoVintage2energy"]
      var wmoVintage2smartDefaults = data["wmoVintage2smartDefaults"]

      var legend = d3.select(this)
          .attr("transform","translate(85,115)");

      // create some definitions
      var defs = legend.append("defs");
      // create arrow marker
      defs.append("marker")
        .attr("id", "legend_pointer")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
       .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill","none");
        // create arrow
      legend.append("line")// attach a line
        .attr("id","pointer_line")
        .style("stroke", "none")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", 1)
        .attr("marker-end","url(#legend_pointer)");

      var xAxis = legend.append("g")
            .attr("id","xAxis");

      var x = d3.scaleLinear()
          .clamp(true);

      var canvas = d3.select("canvas").node(),
          context = canvas.getContext("2d"),
          canvasWidth = canvas.width;

      function updateLegendScale(){
        // legend scale
        x.domain(consumption_extent[units])
          .range([0,width]);

        xAxis.call(d3.axisBottom(x).ticks(5));

        var range = ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"];
        var delta = (consumption_extent[units][1]-consumption_extent[units][0])/range.length
            , min = consumption_extent[units][0]
            , choroplethScale_range = range.map((d,i) => choroplethScale(min+(i*delta)))
        var image = context.createImageData(canvasWidth, 1),
            interpolate = d3.interpolateRgbBasis(choroplethScale_range);

        for (var i = 0, k = 0; i < canvasWidth; ++i, k += 4) {
          var c = d3.rgb(interpolate(i / (canvasWidth - 1)));
          image.data[k] = c.r;
          image.data[k + 1] = c.g;
          image.data[k + 2] = c.b;
          image.data[k + 3] = 255;
        }

        context.putImageData(image, 0, 0);

        d3.selectAll(".voronoi").on('mouseover', function(d){
            d3.select("#legend_pointer")
              .style("opacity",1)
              .style("fill-opacity",1)
              .style("fill","#000")
              .style("stroke","#000")
            var key = "("+d.wmo_id.split("_")[2]+", "+filterYear+")";
            var wmo_consumption = wmoVintage2energy[key][units];
            var xValue = x(wmo_consumption);
            var smartDefaults = wmoVintage2smartDefaults[key];
          //console.log(smartDefaults)
            d3.select("#pointer_line")
              .attr("x1",xValue)
              .attr("x2",xValue)
          // sd lines expand
            d3.select(".sd_lines_"+d.wmo_id.split("_")[2]+"_"+filterYear)
              .style("stroke-width",6.0)
              .style("opacity",1.0);
        })
        // REMOVE POINTER FROM LEGEND
        d3.selectAll(".voronoi").on('mouseout', function(d){
            d3.select("#legend_pointer")
              .style("opacity",1)
              .style("fill-opacity",1)
              .style("fill","none")
              .style("stroke","none")
            //sd lines go back to normal
            d3.select(".sd_lines_"+d.wmo_id.split("_")[2]+"_"+filterYear)
              .style("stroke-width",0.25)
              .style("opacity",0.6);
        })
      //end updateLegendScale
      }
      dispatch_updateLegendScale.on("updateLegendScale",updateLegendScale)
      // MOVE POINTER ON LEGEND
      updateLegendScale()

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
  chart.choroplethScale = function(c) {
    if (!arguments.length) { return choroplethScale; }
    choroplethScale = c;
    return chart;
  };
  chart.consumption_extent = function(c) {
    if (!arguments.length) { return consumption_extent; }
    consumption_extent = c;
    return chart;
  };
  chart.units = function(u) {
    if (!arguments.length) { return units; }
    units = u;
    dispatch_updateLegendScale.call("updateLegendScale")
    return chart;
  };
  chart.filterYear = function(f) {
    if (!arguments.length) { return filterYeart; }
    filterYear=f;
    dispatch_updateLegendScale.call("updateLegendScale")
    return chart;
  };

// end GradientLegend
  return chart
}
