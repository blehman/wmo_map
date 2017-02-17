(function() {

  // get data
  d3.queue()
    .defer(d3.json, "data/us.json")
    //.defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
    //.defer(d3.tsv, "wmo_latlon.tsv")
    .defer(d3.csv,"data/wmo2latlon.csv")
    .defer(d3.csv,"data/postalcode2wmo.csv")
    .await(runApp);

  var margin = { top: 0.10, right: 0.10, bottom: 0.10, left: 0.10 }
  , svg_width = 960
  , svg_height = 600
  , map_size = {"width": svg_width * 0.5, "height":svg_height * 0.5};


  function runApp(error, us, usaf,postalcode2wmo){
    if (error) throw error;
    // constructor for each new viz
    var map_data = [{
      "us":us
      ,"usaf":usaf
      ,"postalcode2wmo":postalcode2wmo
      , "map_size":map_size
    }]
    // create an instance of NewMap
    var vMap = NewMap()
    // update map settings
    vMap.height(map_size.height)
    vMap.width(map_size.width)
    // a container nested under svg
    var svg = d3.select("#viz-container")
      .attr("height",svg_height)
      .attr("width",svg_width)
    // creat container for each viz
    svg.selectAll("g")
        .data(map_data)
       .enter().append("g")
        .attr("id",vMap.id())
        .call(vMap)
  }
}())
