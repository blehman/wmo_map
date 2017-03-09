(function() {

  // get data
  d3.queue()
    .defer(d3.json, "data/us.json")
    //.defer(d3.json, "data/us-10m.v1.json")
    //.defer(d3.json, "data/10m.json")
    //.defer(d3.json, "http://bl.ocks.org/mbostock/raw/4090846/us.json")
    //.defer(d3.tsv, "wmo_latlon.tsv")
    .defer(d3.csv,"data/wmo2latlon.csv")
    .defer(d3.csv,"data/postalcode2wmo.csv")
    .defer(d3.json,"data/wmoVintage2energy.json")
    .defer(d3.json,"data/vintage2nationalTotal.json")
    .defer(d3.json,"data/wmoVintage2smartDefaults_slimest_v2.json")
    .defer(d3.json,"data/smartDefaults.json")
    .await(runApp);

  var margin = { top: 0.10, right: 0.10, bottom: 0.10, left: 0.10 }
  , svg_width = 960
  , svg_height = 600
  , map_size = {"width": svg_width * 0.5, "height":svg_height * 0.5}
  , startYear = "1980"
  , consumption_extent = {"THM":[118,2000],"KWH":[5152,30454]};

  var polygon_fill_opacity = 0.60;

  var change = d3.dispatch("year_change","unit_change");
  var units = "KWH";

  function runApp(error, us, usaf,postalcode2wmo,energy,vintage2nationalTotal,wmoVintage2smartDefaults, smartDefaults){
    if (error) throw error;

    var zip2wmo = {}
      , wmo2energy = {};

    postalcode2wmo.map(function(d){
        zip2wmo[d.zipcode]=d.wmo
    })

    // map meta data
    var map_data = [{
      "us":us
      ,"usaf":usaf
      ,"postalcode2wmo":postalcode2wmo
      ,"map_size":map_size
      ,"zip2wmo":zip2wmo
      ,"wmoVintage2energy":energy
      ,"vintage2nationalTotal":vintage2nationalTotal
      ,"consumption_extent":consumption_extent
      ,"wmoVintage2smartDefaults":wmoVintage2smartDefaults
      ,"smartDefaults":smartDefaults
    }]

    // insert zip
    map_data[0]["zip2wmo"] = zip2wmo

    // create non-svg elements
    var input = NewInput();
    // insert input
    d3.select("#"+input.div_id())
      .selectAll("#"+input.container_id())
      .data(map_data)
     .enter().append("div")
      .attr("id",input.container_id())
      .call(input)
    ;
    // create toggle for consumption
    var cToggle = ConsumptionToggle();
    cToggle.change(change)
    // insert toggle
    d3.select("#"+cToggle.div_id())
      .selectAll("#"+cToggle.container_id())
      .data(map_data)
     .enter().append("div")
      .attr("id",cToggle.container_id())
      .call(cToggle)
    ;

    // create an instance of NewMap
    var vMap = NewMap();
    // update map settings
    vMap.polygon_opacity(polygon_fill_opacity)
    vMap.height(map_size.height)
    vMap.width(map_size.width)
    vMap.filterYear(startYear)
    vMap.change(change)
    vMap.consumption_extent(consumption_extent)
    // create an instance of GradientLegend
    var gLegend = GradientLegend();
    // update legend settings
    gLegend.stop_opacity(polygon_fill_opacity)
    // a container nested under svg
    var svg = d3.select("#viz-container")
        .attr("height",svg_height)
        .attr("width",svg_width)

    // create an instance of YearSlider
    var ySlider = YearSlider();
    ySlider.filterYear(startYear)
    ySlider.change(change)

    // create an instance of YearSlider
    var iHomes = Homes();

    // create a new container for each viz
    // gradient legend

    var legend = svg.selectAll("#"+gLegend.id())
        .data(map_data)
       .enter().append("g")
        .attr("id",gLegend.id());

    var slider = svg.selectAll("#"+ySlider.id())
        .data(map_data)
       .enter().append("g")
        .attr("id",ySlider.id());

    // map
    var map = svg.selectAll("#"+vMap.id())
        .data(map_data)
       .enter().append("g")
        .attr("id",vMap.id())
        .call(vMap);

    var home = svg.selectAll("#"+iHomes.id())
        .data(map_data)
       .enter().append("g")
        .attr("id",iHomes.id());

    // update domain from Map for both legend
    gLegend.consumption_extent(consumption_extent)
    gLegend.choroplethScale(vMap.choroplethScale())
    legend.call(gLegend)
    ySlider.width(gLegend.width())
    slider.call(ySlider)
    iHomes.filterYear(startYear)
    home.call(iHomes)

      change.on("year_change",function(year){
        //update map color
        vMap.filterYear(year)
        //upadate smart default lines
        iHomes.filterYear(year)
    })
      change.on("unit_change",function(units){
        //update map color
        vMap.units(units)
        //update legend scale
        gLegend.units(units)
        //update legend color?
    })

  }
}())
