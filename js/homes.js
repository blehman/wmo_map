function Homes(){

  var id = "homes";

  var height = 10
    , width = 500
    , lineWidth = 200;

  var posX = 85
    , posY = 450;

  var filterYear="1980"
  , units = "KWH"
  , dispatch_updateSmartDefaultLines = d3.dispatch("updateSmartDefaultLines");

  var choroplethScale;

  function chart(selection) {
    selection.each(function(map_data) {
      console.log(map_data)
      var smart_default_domains = map_data["smartDefaults"];
      console.log(smart_default_domains)
      var wmoVintage2smartDefaults = map_data["wmoVintage2smartDefaults"];
      var wmoVintage2energy = map_data["wmoVintage2energy"];

      var homes = d3.select("#"+id)
          .attr("transform","translate(650,140)");

      /*
      homes.insert("image",":first-child")
        .attr("class","green_home")
        .attr("xlink:href","img/noun_379386_cc.png")
        .attr("x",40)
        //.attr("y",85)
        .attr("opacity",0.90)
        .attr("width","60px")
      homes.insert("image",":first-child")
        .attr("class","green_home")
        .attr("xlink:href","img/noun_640195_cc.png")
        .attr("x",-60)
        .attr("y",8)
        .attr("opacity",0.90)
        .attr("width","48px")
      */
      // create scales for each smart default
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
        .attr("class","pointPlots")
        .each(function(d,i){
          var gAxis = d3.select("#"+"scale_"+d)
            .attr("transform","translate(0,"+i*20+")")
          var gScale = smartDefaultScales[d]["linear"]
            gAxis.call(d3.axisBottom(gScale).ticks(3))
        });
      // remove all the axes ticks & labels
      d3.selectAll("#homes .tick").style("opacity",0)
      // add text to axes
      homes.selectAll(".pointPlotLabels")
        .data(smartDefaultLabels)
       .enter().append("text")
        .classed("smartDefaultText",true)
        .attr("id",d => "text_"+d)
        .attr("transform",function(d,i){return "translate(205,"+((i*20)+6)+")";})
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
              .y(function(d,i){return i*20});

          homeLines.selectAll(".sd_lines_"+wmo+"_"+year)
            .data([sd])
            .enter().append("path")
            .classed("sd_lines_"+wmo+"_"+year,true)
            .attr("d",line)
            .attr("fill","none")
            .attr("stroke",choroplethScale(wmoVintage2energy[key][units]))
            .attr("stroke-width",0.25)
            .attr("opacity",0.60)
        // end forEach
        })
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
  // end Homes
  return chart
}
