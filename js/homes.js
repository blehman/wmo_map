function Homes(){

  var id = "homes";

  var height = 10
    , width = 500
    , lineWidth = 100
    , multiplier=47
    , bar_height = multiplier *0.80;

  var posX = 85
    , posY = 450;

  var filterYear="1980"
  , units = "KWH"
  , dispatch_updateSmartDefaultLines = d3.dispatch("updateSmartDefaultLines")

  var bar_opacity;

  var choroplethScale;

  function chart(selection) {
    selection.each(function(map_data) {
      //console.log(map_data)
      var smart_default_domains = map_data["smartDefaults"];
      //console.log(smart_default_domains)
      var wmoVintage2smartDefaults = map_data["wmoVintage2smartDefaults"];
      var wmoVintage2energy = map_data["wmoVintage2energy"];
      var vintage2defaultCounts = map_data["vintage2defaultCounts"];
      var smartDefaultBars_yAxis = d3.scaleLinear()
          .domain([0,220])
          .range([1,bar_height])
      console.log(vintage2defaultCounts)
      // create container for this section
      var homes = d3.select("#"+id)
          .attr("transform","translate(640,115)");

      var opacity_slider = homes.append("g")
          .attr("transform","translate(275,"+multiplier+")")
          .classed("opacity-slider",true);

      var line_path = d3.line()
          .x(d => d.x)
          .y(d=> d.y);

      var max_y = multiplier*6,
      slider_line_points = [{"x":0,"y":0},{"x":0,"y":max_y}]

      var os_line = opacity_slider
          .selectAll(".opacity-slider-line")
          .data([slider_line_points])
          .enter()
        .append("path")
          .classed("opacity-slider-line",true)
          .style("stroke","black")
          .style("stroke-width","0.25px")
          .attr("d",line_path);

      var os_curve_scale = d3.scalePow()
          .exponent(4)
          .domain([0,max_y])
          .range([0.01,1]);
      var os_bar_scale = d3.scaleLinear()
          .domain([0,max_y])
          .range([1,0.1]);

      var startpoint = max_y/2

      d3.selectAll(".smartDefaultBars")
          .style("opacity",os_bar_scale(startpoint))

      d3.selectAll(".lines path")
          .style("opacity",os_curve_scale(startpoint))

      var os_point = opacity_slider
          .append("circle")
          .attr("id","opacity-slider-drag")
          .style("fill","red")
          .attr("r",5)
          .attr("cx",0)
          .attr("cy",startpoint)
          .call(d3.drag()
            .on("start",dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


      function dragstarted(d) {
        d3.select(this).style("fill","green");
      }

      function dragged(d) {
        var y_value = d3.max([0, d3.min([d3.event.y,max_y])]);
          //log_y_value = Math.exp(y_value);
        // change value of invisible slider rect
        d3.select(this).attr("cy", d.y = y_value);
        d3.selectAll("#lines path")
          .style("opacity",os_curve_scale(y_value))

        d3.selectAll(".smartDefaultBars")
          .style("opacity",os_bar_scale(y_value))
      }

      function dragended(d) {
        d3.select(this).style("fill", "red");
      }





      // create scales for each smart default
      var legendScale = d3.scaleOrdinal()
          .domain(["less","more"])
          .range([0,lineWidth]);

      var smartDefaultLegend = homes.append("g")
          .classed("smartDefaultText",true);

      var smartDefaulLegendText = smartDefaultLegend
          .append("text")
          .attr("transform","translate(50,"+-5+")")
          .classed("smartDefaulText",true)
         //.attr("x",20)
         //.attr("y",1)
          .attr("fill","black")
          .text("Efficiency");

      var smartDefaultLegendAxis = smartDefaultLegend
          .call(d3.axisBottom(legendScale).ticks(1))

      var smartDefaultScales = {};

      var smartDefaultNames = [
        "hvac-cooling-age"
        , 'hvac-heating-age'
        , "floorConstructionName"
        , 'roofConstructionName'
        , 'wallConstructionName'
        , 'windowConstructionName'
        , 'infiltration'];

      var smartDefaultLabels = [
        'HVAC Cooling Age'
        , 'HVAC Heating Age'
        , 'Floor Type'
        , 'Roof Type'
        , 'Wall Type'
        , 'Window Type'
        , 'Infiltration'];

      smartDefaultNames.forEach(function(d,i){

        var s1 = d3.scaleOrdinal()
          .domain(smart_default_domains[d])
          .range(d3.range(0,smart_default_domains[d].length));

        var s2 = d3.scaleLinear()
          .domain(d3.extent(s1.range()))
          .range([0,lineWidth]);

        smartDefaultScales[d] = {"ordinal":s1,"linear":s2};

      })
      // add axes
      homes.selectAll(".pointPlots")
        .data(smartDefaultNames)
       .enter().append("g")
        .attr("id",d=>"scale_"+d)
        .attr("class","pointPlots domain")
        //.style("fill","black")
        .each(function(d,i){
          var gAxis = d3.select("#"+"scale_"+d)
            .attr("transform","translate(0,"+((i+1)*multiplier)+")");
          var gScale = smartDefaultScales[d]["linear"];
          gAxis.call(d3.axisBottom(gScale).ticks(3))
        });
      // remove all the axes ticks & labels
      d3.selectAll(".pointPlots .tick").style("opacity",0)
      // add text to axes
      homes.selectAll(".pointPlotLabels")
        .data(smartDefaultLabels)
       .enter().append("text")
        .classed("smartDefaultText",true)
        .attr("id",d => "text_"+d)
        .attr("transform",function(d,i){return "translate(108,"+(((i+1)*multiplier)+6)+")";})
        .text(d=>d)
      // add circels to axes
        // tbd
      // add lines to axes
      function updateSmartDefaultLines(){
        homes.selectAll("#lines").remove();
        var homeLines = homes.append("g").attr("id","lines");
        Object.keys(wmoVintage2smartDefaults).filter(d=>+d.split(", ")[1].replace(")","")==filterYear).map(function(key){
          var s = key.split(", ")
            , wmo = s[0].replace("(","")
            , year = s[1].replace(")","");
          var sd = wmoVintage2smartDefaults[key];
          var line = d3.line()
              .x(function(d,i){
                var ordinal_value = smartDefaultScales[d.name]["ordinal"](d.value);
                var linear_value =  smartDefaultScales[d.name]["linear"](ordinal_value);
                return linear_value;
              })
              .y(function(d,i){return (i+1)*multiplier})
              //.curve(d3.curveCardinal.tension(0.5));
              //.curve(d3.curveBundle.beta(1));
              .curve(d3.curveCatmullRom.alpha(1));
          homeLines.selectAll(".sd_lines_"+wmo+"_"+year)
            .data([sd])
            .enter().append("path")
            .classed("sd_lines_"+wmo+"_"+year,true)
            .attr("d",line)
            .attr("fill","none")
            .attr("stroke",choroplethScale(wmoVintage2energy[key][units]))
            .attr("stroke-width",0.25)
            .style("opacity",0.01)

        // end map
        })

        // BUILD BARS
        d3.selectAll(".smartDefaultBars").remove()
        var bars = homes.append("g")
          .classed("bars",true);

        smartDefaultNames.map(function(default_name,i){
          var data = vintage2defaultCounts["year"+filterYear][default_name];
          // make rects
          bars.selectAll("."+default_name+"-bars")
            .data(data)
           .enter().append("rect")
            .attr("class",default_name+"-bars")
            .classed("smartDefaultBars",true)
            .attr("x",function(d,i){
              var ordinal_value = smartDefaultScales[default_name]["ordinal"](d.value);
              var linear_value =  smartDefaultScales[default_name]["linear"](ordinal_value);
              return linear_value
            })
            //.attr("y",d => (1+i)*multiplier)
            .attr("y",d => (1+i)*multiplier-smartDefaultBars_yAxis(d.count))
            .attr("width",5)
            .attr("height",d => smartDefaultBars_yAxis(d.count))
            .attr("fill","gray")
            .attr("stroke","gray")
            .attr("opacity",0.4);
        })
        //vintage2defaultCounts[year]
      // end updateSmartDefaultLines
      }
      updateSmartDefaultLines()
      dispatch_updateSmartDefaultLines.on('updateSmartDefaultLines',updateSmartDefaultLines)

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
  chart.filterYear = function(y) {
    if (!arguments.length) { return filterYear; }
    filterYear = y;
    dispatch_updateSmartDefaultLines.call("updateSmartDefaultLines")
    return chart;
  };
  chart.units = function(u) {
    if (!arguments.length) { return units; }
    units = u;
    dispatch_updateSmartDefaultLines.call("updateSmartDefaultLines")
    return chart;
  };
  chart.choroplethScale = function(c) {
    if (!arguments.length) { return choroplethScale; }
    choroplethScale = c;
    return chart;
  };
  chart.bar_opacity = function(b) {
    if (!arguments.length) { return bar_opacity; }
    bar_opacity = b;
    return chart;
  };
  // end Homes
  return chart
}
