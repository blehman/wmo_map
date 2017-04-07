function NewMap(){

  var id = "map-voronoi";

  var height = d3.select("#viz-container").attr("width")
    , width = d3.select("#viz-container").attr("height")

  var voronoi = d3.voronoi()
      .x( d => +d.screen_long)
      .y( d => +d.screen_lat)

  var wmo = [];
  var polygon_opacity = 0.00;
  var colorScale = d3.scaleLinear();

  var consumption_extent,
      choroplethScale;

  var filterYear="1980";
  var units="KWH";
  var dispatch_updateVoronoiColor = d3.dispatch("updateVoronoiColor")
  var change
    ,units;
  function chart(selection) {
    selection.each(function(map_data) {
      // set var
      var us = map_data["us"]
        , usaf = map_data["usaf"]
        , postalcode2wmo = map_data["postalcode2wmo"]
        , zip2wmo = map_data["zip2wmo"]
        , wmoVintage2energy = map_data["wmoVintage2energy"]
        , consumption = [];
      // build map projection
      var projection = d3.geoAlbers()
          .scale(700)
          .translate([width / 2, height / 2])
          .clipExtent([[-20, -10], [width+20, height+50]]);
      var path = d3.geoPath()
          .projection(projection)
          .pointRadius(1.5);
      // pack meta_data for map
      usaf.forEach(function(d) {
          d['screen_coords']=projection([+d.usaf_longitude,+d.usaf_latitude])
          d['screen_long']=d['screen_coords'][0]
          d['screen_lat']=d['screen_coords'][1]
          wmo.push([+d.usaf_longitude,+d.usaf_latitude])
      })
      // create container for map elements
      var viz_g = d3.select("#"+id)
          .attr("transform","translate(30,220)");
      // BUILD DEFS FOR CLIPING

      //var tVoronoi = geoVoronoi(wmo, geoDelaunay(wmo)).geometries;
      var defs = viz_g.append("defs");
      defs.append("path")
          .datum(topojson.feature(us, us.objects.land))
          .attr("id", "land")
          .attr("d", path);

      defs.append("clipPath")
          .attr("id", "clip")
        .append("use")
          .attr("xlink:href", "#land");

      // BUILD MAP
      // DRAW US
      viz_g.append("path")
          .datum(topojson.feature(us, us.objects.land))
          //.datum(topojson.feature(us, us.objects.nation))
          .attr("class", "land")
          .attr("d", path);
      // DRAW STATES
      viz_g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "states")
          .attr("d", path);
      // PLOT POINTS
      viz_g.append("path")
          .datum({type: "MultiPoint", coordinates: wmo})
          .attr("class", "points")
          .style("fill","none")
          .style("stroke-width","0.0px")
          .style("stroke","none")
          .transition()
          .duration(1000)
          .style("stroke-width","0.2px")
          .style("stroke","black")
          //.style("fill","none")
          .style("opacity","1")
          .attr("d", path)
          .attr("r",5)
          .transition()
          .duration(2000)
          .style("stroke-width","0px");
      //BUILD VORONOI POLYGONS
      // set voronoi to new map size
      voronoi.extent([[-15, -10], [width + 15, height + 15]])
      var v = voronoi(usaf)
        , poly = v.polygons();
      // pack polygons w/ wmo_id
      var vData = v.cells.map(function(d,i){
        element = {
          'geo': [d.site[0],d.site[1]]
         ,'wmo_id': "wmo_id_"+d.site.data.usaf
         ,'poly': poly[d.site.index]
         //,'opacity':choroplethOpacityScale(wmo_consumption)
         ,'opacity': polygon_opacity
         //,'click':choroplethOpacityScale(wmo_consumption)
         ,'click': polygon_opacity
         //,'color': choroplethScale(wmo_consumption)
        }
        return element;
      })
      // DRAW VORONOI POLYGONS
      var polygons = viz_g.append("g")
          .attr("clip-path", "url(#clip)")
          .classed("polygon_container",true)
          .selectAll("path")
          .data(vData)
         .enter().append("path")
          .attr("class", "voronoi")
          .attr("id", d => d.wmo_id)
          .attr("d", function(d) {
                var polygon_coords = d.poly.filter(function(d) { return d != null; })
                return polygon_coords ? "M" + polygon_coords.join("L") + "Z" : null;
          })
      // STYLE POLYGONS
      polygons
          .style("stroke-width","0.15px")
          .style("stroke","#999")
          .style("fill-opacity",polygon_opacity);
      updateVoronoiColor()
      // DECIDE WHAT TO DO ON CLICK
      polygons.on("click",function(d){
          //var click = d.click==d.opacity ? 0:d.opacity;
          //d3.select(this).style("fill-opacity", click)
          //d.click = click
          console.log("CLICK")
      })

      function updateVoronoiColor(){
        subdomain = {"KWH":[6000, 13000], "THM": [100, 2000], "THERMS_JOULES": [100, 1000]}
        s1 = d3.scaleLinear()
          .domain(subdomain[units])
          .range([1,0]);
        choroplethScale = function(d){return d3.interpolateRdBu(s1(d))};

        polygons
          .style("fill", function(d){
            var key = "("+d.wmo_id.split("_")[2]+", "+filterYear+")"
            var wmo_consumption = wmoVintage2energy[key][units];
            return choroplethScale(wmo_consumption);
          });
      }

      dispatch_updateVoronoiColor.on("updateVoronoiColor", updateVoronoiColor)

      viz_g.append("g")
        .attr("id","map-text")
        .append("text")
        .classed("heading",true)
        .attr("x",-12)
        .attr("y",5)
        .text("Hover Map for Consumption Results")
      
      var bardefs = viz_g.append("defs");
      
      var linearGradient = bardefs.append("linearGradient")
        .attr("id", "linear-gradient");

      linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
      
      //Set the color for the start (0%)
      linearGradient.append("stop") 
        .attr("offset", "0%")   
        .attr("stop-color", "rgb(14, 50, 90)"); 
      
      //Set the color for the middle (50%)
      linearGradient.append("stop") 
        .attr("offset", "50%")   
        .attr("stop-color", "#fff"); 
  
      //Set the color for the end (100%)
      linearGradient.append("stop") 
        .attr("offset", "100%")   
        .attr("stop-color", "rgb(90, 9, 34)"); 

      viz_g.append("rect")
        .classed("legend",true)
        .attr("x",-9)
        .attr("y",21)
        .attr("width", 479)
      	.attr("height", 5)
      	.style("fill", "url(#linear-gradient)");
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
  chart.polygon_opacity = function(p) {
    if (!arguments.length) { return polygon_opacity; }
    polygon_opacity = p;
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
  chart.filterYear = function(y) {
    if (!arguments.length) { return filterYear; }
    filterYear = y;
    dispatch_updateVoronoiColor.call("updateVoronoiColor")
    return chart;
  };

  chart.change = function(c) {
    if (!arguments.length) { return change; }
    change = c;
    return chart;
  };

  chart.units = function(u) {
    if (!arguments.length) { return units; }
    units = u;
    dispatch_updateVoronoiColor.call("updateVoronoiColor")
    return chart;
  };

// end NewMap
  return chart
}

