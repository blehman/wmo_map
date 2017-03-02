function GradientLegend(){

  var id = "gradient-legend";

  var height = 7
    , width = 510;
  var stop_opacity = 0.60

  var choroplethScale;

  var domain;

  function chart(selection) {
    selection.each(function(data) {
      console.log(data)
      var wmoVintage2energy = data["wmoVintage2energy"]
      console.log(wmoVintage2energy)

      var legend = d3.select(this)
          .attr("transform","translate(85,65)");

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
/*
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
*/
      // legend scale
      var x = d3.scaleLinear()
          .domain(d3.extent(domain))
          .range([0,width])

      var xAxis = legend.append("g")
          .attr("id","xAxis")
          .call(d3.axisBottom(x))

      var canvas = d3.select("canvas").node(),
          context = canvas.getContext("2d"),
          canvasWidth = canvas.width;
/*
      var x0 = d3.scaleQuantize()
          .domain([0, 1])
          .range(["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"]); // PiYG
*/
      var range = ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"];
      var delta = (domain[1]-domain[0])/range.length
          , min = domain[0]
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
  chart.choroplethScale = function(c) {
    if (!arguments.length) { return choroplethScale; }
    choroplethScale = c;
    return chart;
  };


// end GradientLegend
  return chart
}
