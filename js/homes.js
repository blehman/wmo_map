function Homes(){

  var id = "homes";

  var height = 10
    , width = 500
    , lineWidth = 200;

  var posX = 85
    , posY = 450;

  function chart(selection) {
    selection.each(function(map_data) {
      console.log(map_data)
      var smart_default_domains = map_data["smartDefaults"];
      console.log(smart_default_domains)
      var wmoVintage2smartDefaults = map_data["wmoVintage2smartDefaults"];

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
      // remove all the ticks & labels
      d3.selectAll("#homes .tick").style("opacity",0)
      homes.selectAll(".pointPlotLabels")
        .data(smartDefaultLabels)
       .enter().append("text")
        .classed("smartDefaultText",true)
        .attr("id",d => "text_"+d)
        .attr("transform",function(d,i){return "translate(205,"+((i*20)+6)+")";})
        .text(d=>d)

      // add notes to graph
      var homeNodes = homes.append("g").attr("id","nodes");
      Object.keys(wmoVintage2smartDefaults).forEach(function(key){
        var s = key.split(", ")
          , wmo = s[0].replace("(","")
          , year = s[1].replace(")","");
        var sd = wmoVintage2smartDefaults[key];
        homeNodes.selectAll(".sd_points_"+wmo+"_"+year)
          .data(sd)
          .enter().append("circle")
          .classed("sd_points_"+wmo+"_"+year,true)
          .attr("cy",function(d,i){
            return i*20
          })
          .attr("cx",d => smartDefaultScales[d.name]["linear"](smartDefaultScales[d.name]["ordinal"](d.value)))
          .attr("fill","none")
          .attr("stroke","black")
          .attr("opacity",0.50)
          .attr("r",2);
      })

/*
      smartDefaultNames.forEach(function(d,i){
      })
      var pointArray = d3.select("#floorConstructionName")
        .call(d3.axisBottom(smartDefaultScales["floorConstructionName"]));
*/
        //.call(d => d3.axisBottom(smartDefaultScales[d]))

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
// end Homes
  return chart
}
