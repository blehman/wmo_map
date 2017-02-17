function NewMap(){

  var id = "map-voronoi";

  var height = d3.select("#viz-container").attr("width")
    , width = d3.select("#viz-container").attr("height")

  var voronoi = d3.voronoi()
      .x( d => +d.screen_long)
      .y( d => +d.screen_lat)

  var wmo = [];

  function chart(selection) {
    selection.each(function(map_data) {
      d3.select("svg").append("rect")
        .attr("x",680)
        .attr("y",420)
        .classed("rect",true)
        .attr("height",20)
        .attr("width",40)
      // set data vars
      var us = map_data["us"]
        , usaf = map_data["usaf"]
        , postalcode2wmo = map_data["postalcode2wmo"];

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
          .attr("d", path);

      // set voronoi to new map size
      voronoi.extent([[-15, -10], [width + 15, height + 15]])

      var v = voronoi(usaf)
        , poly = v.polygons();
      var vData = v.cells.map(function(d,i){
        element = {
          'geo':[d.site[0],d.site[1]]
         ,'wmo_id':d.site.data.usaf
         ,'poly':poly[d.site.index]
         ,'click':0
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
          });
      polygons.on("click",function(d){
            var click = d.click ? 0: 0.50;
            var opacity =  d3.select(this).style("fill-opacity", click)
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
      function zipcodeReview(){
        console.log(zip2wmo[d3.select("#zip").attr("value")])
      }
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
