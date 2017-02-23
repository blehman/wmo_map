function NewMap(){

  var id = "map-voronoi";

  var height = d3.select("#viz-container").attr("width")
    , width = d3.select("#viz-container").attr("height")

  var voronoi = d3.voronoi()
      .x( d => +d.screen_long)
      .y( d => +d.screen_lat)

  var wmo = [];

  var colorScale = d3.scaleLinear();

  function chart(selection) {
    selection.each(function(map_data) {
      console.log(map_data)
      d3.select("svg").append("rect")
        .attr("x",680)
        .attr("y",420)
        .classed("rect",true)
        .attr("height",20)
        .attr("width",40)
      // set data vars
      var us = map_data["us"]
        , usaf = map_data["usaf"]
        , postalcode2wmo = map_data["postalcode2wmo"]
        , zip2wmo = map_data["zip2wmo"]
        , wmoVintage2energy = map_data["wmoVintage2energy"]
        , vintage2nationalTotal = map_data["vintage2nationalTotal"];

      // find extent of total consumption by wmo
      var filterYear = "1980"
        , consumption = [];
      Object.keys(wmoVintage2energy).map(function(d){
        year = d.slice(9,13);
        //console.log(wmoVintage2energy[d].total_consumption_KWH)
        if (filterYear == year){
          consumption.push(wmoVintage2energy[d].total_consumption_KWH)
        }
      })
      //console.log(consumption)
      //console.log(d3.extent(consumption))
      var consumption_extent = d3.extent(consumption)
      , consumption_min = consumption_extent[0]
      , consumption_max = consumption_extent[1]
      , consumption_mid = (consumption_min+consumption_max) / 2.0
      , consumption_domain = [consumption_min,consumption_mid, consumption_max];
      var choroplethScale = d3.scaleLinear()
          .domain(consumption_domain)
          .range(["green","yellow","red"]);
      var choroplethOpacityScale = d3.scaleLinear()
          .domain(d3.extent(consumption))
          .range([0.20,0.50]);
      // build map projection
      var projection = d3.geoAlbers()
        .scale(700)
        .translate([width / 2, height / 2]);

      var path = d3.geoPath()
        .projection(projection)
        .pointRadius(1.5);

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
          .attr("transform","translate(100,90)");

      // build map elements
      viz_g.append("path")
          .datum(topojson.feature(us, us.objects.land))
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
          .attr("r",5);

      // set voronoi to new map size
      voronoi.extent([[-15, -10], [width + 15, height + 15]])

      var v = voronoi(usaf)
        , poly = v.polygons()
        , polygon_opacity = 0.50;

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


      polygons.transition()
          .delay(3000)
          .duration(3000)
          .style("stroke-width","1px")
          .style("stroke","red")
         .transition()
          .delay(2000)
          .duration(4000)
          .style("stroke-width","0.5px")
          .style("stroke","#999")
         .transition()
          .delay(1000)
          .duration(5000)
          .style("fill", d => d.color)
          .style("fill-opacity", 0.20)
         .transition()
          .duration(2000)
          .style("fill-opacity", d => d.opacity)

      polygons.on("click",function(d){
            var click = d.click==d.opacity ? 0:d.opacity;
            d3.select(this).style("fill-opacity", click)
            d.click = click
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
// end NewMap
  return chart
}
