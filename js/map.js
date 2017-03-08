function NewMap(){

  var id = "map-voronoi";

  var height = d3.select("#viz-container").attr("width")
    , width = d3.select("#viz-container").attr("height")

  var voronoi = d3.voronoi()
      .x( d => +d.screen_long)
      .y( d => +d.screen_lat)

  var wmo = [];
  var polygon_opacity = 0.60;
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
      // updatable vars
      // set var
      var us = map_data["us"]
        , usaf = map_data["usaf"]
        , postalcode2wmo = map_data["postalcode2wmo"]
        , zip2wmo = map_data["zip2wmo"]
        , wmoVintage2energy = map_data["wmoVintage2energy"]
        , vintage2nationalTotal = map_data["vintage2nationalTotal"]
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
          .attr("transform","translate(100,150)");
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
          var click = d.click==d.opacity ? 0:d.opacity;
          d3.select(this).style("fill-opacity", click)
          d.click = click
      })

      function updateVoronoiColor(){
        subdomain = {"KWH":[5000, 20000], "THM": [100, 2000]}
        s1 = d3.scaleLinear()
          .domain(subdomain[units])
          .range([0,1]);
        choroplethScale = function(d){return d3.interpolateRdBu(s1(d))};

        polygons
          .style("fill", function(d){
            var key = "("+d.wmo_id.split("_")[2]+", "+filterYear+")"
            var wmo_consumption = wmoVintage2energy[key][units];
            return choroplethScale(wmo_consumption);
          });
      }

      dispatch_updateVoronoiColor.on("updateVoronoiColor", updateVoronoiColor)

      //var land = topojson.feature(us, us.objects.land);
      //console.log(land)
      //max_len = 0

//
// Unnecessary because extent will be static - this extent is now set in app.js
//
/*

      // find extent of total consumption by wmo
      Object.keys(wmoVintage2energy).map(function(d){
        year = d.slice(9,13);
        //console.log(wmoVintage2energy[d].total_consumption_KWH)
        if (filterYear == year){
          consumption.push(wmoVintage2energy[d].total_consumption_KWH)
        }
      })
      //console.log(consumption)
      //console.log(d3.extent(consumption))
      consumption_extent = d3.extent(consumption)

      var consumption_min = consumption_extent[0]
      , consumption_max = consumption_extent[1]
      , consumption_mid = (consumption_min+consumption_max) / 2.0
      , consumption_domain = [consumption_min,consumption_mid, consumption_max]
      , consumption_delta = (consumption_max-consumption_min)/6;
*/

/*
      choroplethScale = d3.scaleLinear()
          .domain([
             consumption_min
            , consumption_min+consumption_delta
            , consumption_min+(consumption_delta*2)
            , consumption_min+(consumption_delta*3)
            , consumption_min+(consumption_delta*4)
            //, consumption_min+(consumption_delta*5)
            //, consumption_min+(consumption_delta*6)
          ]
          )
          //.range(["#31a354","#a1d99b","#e34a33"]); green to red
          //.range(["#fff7bc","#fec44f","#d95f0e"]);
          .range(["#1a9850","#91cf60","#d9ef8b","#fee08b","#fc8d59","#d73027"])
*/

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
          //.range(["white","red"]);
      //planning to delete this scale
      /*
      var choroplethOpacityScale = d3.scaleLinear()
          .domain(d3.extent(consumption))
          .range([0.40,0.50]);
      */



      // build map elements
      /*
       var path = d3.geoPath()
  viz_g.append("path")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 0.5)
      .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })));

  viz_g.append("path")
      .attr("stroke-width", 0.5)
      .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })));

  viz_g.append("path")path({type: "Point", coordinates: [d]}))
      .attr("d", path(topojson.feature(us, us.objects.nation)));

*/



      /*
      land.geometry.coordinates.forEach(function(arrayOfArrays,i){
        arrayOfArrays.forEach(function(d,i){
          var len = d.length;
          if (max_len<d.length){
            max_len = len
            //console.log([max_len,i])
          }
        })
      })
      */
      //console.log(land.geometry.coordinates[0][0])
      //
      //
      //NOT USING YET
/*
      var mainland_points = land.geometry.coordinates[0][0]
      console.log(mainland_points[0])
      mainland_points.push(mainland_points[0])

      //mainland_points.forEach(d => console.log(d))
      //mainland_points.forEach(d => console.log(path({type: "Point", coordinates: [d]})))
      //console.log("TEST")
      var projected_mainland_points = mainland_points.map(function(d,i){
        var value = projection(d);
        //console.log(value)
        if (value){return value}else{console.log(d)}
      })
*/
// draw mainlaind points
/*
      var mainland_map = viz_g.append("g")
          .classed("mainland",true)
          .selectAll("path")
          .data([projected_mainland_points])
         .enter().append("path")
          .attr("class", "mainland")
          .attr("d",d => "M" + d.join("L"))
          .style("stroke-width","3px")
          .style("stroke","#999")
          .style("fill", "red")
          .style("fill-opacity",1)
          //.attr("transform","translate(500,0)");
*/
//
      //
      //NOT USING YET
/*
      var mainland =  turf.polygon([projected_mainland_points])
      console.log(mainland)
      //var rings = land.geometry.coordinates.map(function(rings) { if (rings[0]!==undefined){return rings[0];} });
      //console.log(rings)

      var sects = []
*/
/*
      poly.map(function(v1){
        // adding v1[0] to the array to close the polygon
        v1.push(v1[0])
        var v1_poly = turf.polygon([v1])
        console.log(v1_poly)
        var intersection  = turf.intersect(mainland,v1_poly);
        if (intersection !== undefined){
          sects.push(intersection)
        }
      })
      console.log(sects)
*/
      //var test = poly.map(d => );
      //console.log()



/*
      var defs = viz_g.append("defs");

      defs.append("path")
          .datum(topojson.feature(us, us.objects.land))
          .attr("id", "land")
          .attr("d", path);

      defs.append("clipPath")
          .attr("id", "clip")
        .append("use")
          .attr("xlink:href", "#land");

      viz_g.append("use")
          .attr("xlink:href", "#land")
          .attr("class", "land");
*/

    /*      .attr("d", function(d) {
            console.log(d)
            var value =  "M" + d
                .filter(function(d) { return d != null; })
                .map(function(d) { return d.join("L"); })
                .join("ZM") + "Z";
            console.log(value)
            return value
          });
    */
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

