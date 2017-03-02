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

  function chart(selection) {
    selection.each(function(map_data) {
      console.log(map_data)
      d3.select("svg").append("rect")
        .classed("fudge",true)
        .attr("x",680)
        .attr("y",430)
        .classed("rect",true)
        .attr("height",20)
        .attr("width",40)

      d3.select("svg").append("rect")
        .classed("fudge",true)
        .attr("x",65)
        .attr("y",0)
        .classed("rect",true)
        .attr("height",20)
        .attr("width",40);

      // set data vars
      var us = map_data["us"]
        , usaf = map_data["usaf"]
        , postalcode2wmo = map_data["postalcode2wmo"]
        , zip2wmo = map_data["zip2wmo"]
        , wmoVintage2energy = map_data["wmoVintage2energy"]
        , vintage2nationalTotal = map_data["vintage2nationalTotal"]
        , consumption = [];
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

      var legendAxisScale =d3.scaleLinear()
          .domain(d3.extent(consumption_extent))
          .range([0,510])

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
     console.log(consumption_extent)
     e = [10000, 50000]
     s1 = d3.scaleLinear()
          .domain(e)
          .range([0,1])

     //choroplethScale = function(d){return d3.interpolateYlOrRd(s1(d)); }
     choroplethScale = function(d){return d3.interpolateRdBu(s1(d)); }
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
      var choroplethOpacityScale = d3.scaleLinear()
          .domain(d3.extent(consumption))
          .range([0.40,0.50]);
      // build map projection
      var projection = d3.geoAlbers()
        .scale(700)
        .translate([width / 2, height / 2]);

      var path = d3.geoPath()
        .projection(projection)
        .pointRadius(1.5);

      //var path = d3.geoPath();

      // pack meta_data
      usaf.forEach(function(d) {
        //console.log(d)
        //console.log(projection([+d.usaf_longitude,+d.usaf_latitude]))
        d['screen_coords']=projection([+d.usaf_longitude,+d.usaf_latitude])
        d['screen_long']=d['screen_coords'][0]
        d['screen_lat']=d['screen_coords'][1]
        wmo.push([+d.usaf_longitude,+d.usaf_latitude])
      })
      // build zipcode lookup
      var zip2wmo = {}

      postalcode2wmo.map(function(d){
        zip2wmo[d.zipcode]=d.wmo
      })
      // create container for map elements
      var viz_g = d3.select("#"+id)
          .attr("transform","translate(100,100)");

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

  viz_g.append("path")
      .attr("d", path(topojson.feature(us, us.objects.nation)));

*/
      viz_g.append("path")
          .datum(topojson.feature(us, us.objects.land))
          //.datum(topojson.feature(us, us.objects.nation))
          .attr("class", "land")
          .attr("d", path);

      viz_g.append("path")
          .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
          .attr("class", "states")
          .attr("d", path);

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

      // set voronoi to new map size
      voronoi.extent([[-15, -10], [width + 15, height + 15]])

      var v = voronoi(usaf)
        , poly = v.polygons();

      //var test = poly.map(d => );
      //console.log()

      var vData = v.cells.map(function(d,i){
        //console.log(d)
        var key = "("+d.site.data.usaf+", "+filterYear+")"
        //console.log(wmoVintage2energy)
        //var key = (+d.site.data.usaf,+filterYear)
        var wmo_consumption = wmoVintage2energy[key].total_consumption_KWH
        //console.log(wmo_consumption)
        element = {
          'geo':[d.site[0],d.site[1]]
         ,'wmo_id':"wmo_id_"+d.site.data.usaf
         ,'poly':poly[d.site.index]
         ,'opacity':choroplethOpacityScale(wmo_consumption)
         ,'click':choroplethOpacityScale(wmo_consumption)
         ,'color': choroplethScale(wmo_consumption)
      }
        return element;
      })

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

      polygons
          .style("stroke-width","0.15px")
          .style("stroke","#999")
          .style("fill", d => d.color)
          .style("fill-opacity",polygon_opacity);

      polygons.on("click",function(d){
          var click = d.click==d.opacity ? 0:d.opacity;
          d3.select(this).style("fill-opacity", click)
          d.click = click
      })

      polygons.on('mouseout', function(d){
          console.log(d)
          d3.select("#legend_pointer")
            .style("opacity",1)
            .style("fill-opacity",1)
            .style("fill","none")
            .style("stroke","none")

      })
      polygons.on('mouseover', function(d){
          d3.select("#legend_pointer")
            .style("opacity",1)
            .style("fill-opacity",1)
            .style("fill","#000")
            .style("stroke","#000")

          var key = "("+d.wmo_id.split("_")[2]+", "+filterYear+")";
          var wmo_consumption = wmoVintage2energy[key].total_consumption_KWH;
          var xValue = legendAxisScale(wmo_consumption);
          console.log(wmo_consumption)
          d3.select("#pointer_line")
            .attr("x1",xValue)
            .attr("x2",xValue)

      })


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
  chart.filterYear= function(y) {
    if (!arguments.length) { return filterYear; }
    filterYear = y;
    return chart;
  };

// end NewMap
  return chart
}

