(function() {
  
  function resizeInput() {
    const dimensions = document.getElementById('zipcode-input-field').getBoundingClientRect();
    const zipInputD3 = d3.select('#zip');
    const inputHeight = dimensions.bottom - dimensions.top;
    const inputWidth = dimensions.width;
    const inputLeft = dimensions.left;
    const inputTop = dimensions.top;
    
    zipInputD3
      .style('width', inputWidth + 'px')
      .style('top', inputTop + 'px')
      .style('left', inputLeft + 'px')
      .style('height', inputHeight + 'px')
  }

  d3.select(window).on('resize', resizeInput);
  
  d3.timeout( resizeInput, 500)
  // get data
  d3.queue()
    //.defer(d3.json, "https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/us.json")
    .defer(d3.json, "data/us.json")
    .defer(d3.csv,"data/wmo2latlon.csv")
    //.defer(d3.csv,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/wmo2latlon.csv")
    //.defer(d3.csv,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/postalcode2wmo.csv")
    .defer(d3.csv,"data/postalcode2wmo.csv")
    //.defer(d3.json,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/wmoVintage2energy_v7_wy2016.json")
    .defer(d3.json,"data/wmoVintage2energy_v7_wy2016.json")
    //.defer(d3.json,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/wmoVintage2smartDefaults_v7_wy2016.json")
    .defer(d3.json,"data/wmoVintage2smartDefaults_v7_wy2016.json")
    //.defer(d3.json,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/smartDefaults.json")
    .defer(d3.json,"data/smartDefaults.json")
    //.defer(d3.json,"https://raw.githubusercontent.com/blehman/wmo_map/gh-pages/data/vintage2defaultCounts_v7_wy2016.json")
    .defer(d3.json,"data/vintage2defaultCounts_v7_wy2016.json")
    .await(runApp);

  var margin = { top: 0.10, right: 0.10, bottom: 0.10, left: 0.10 }
  , svg_width = 795
  , svg_height = 700
  , map_size = {"width": 480, "height":450}
  , startYear = "1990"
  , consumption_extent = {"THM":[118,2000],"KWH":[5152,15454], "THERMS_JOULES":[118,1300]};

  var polygon_fill_opacity = 0.60;

  var change = d3.dispatch("year_change","unit_change","opacity_change");
  var units = "KWH";

  function runApp(error,us,usaf,postalcode2wmo,energy,wmoVintage2smartDefaults,smartDefaults,vintage2defaultCounts){
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
      ,"consumption_extent":consumption_extent
      ,"wmoVintage2smartDefaults":wmoVintage2smartDefaults
      ,"smartDefaults":smartDefaults
      ,"vintage2defaultCounts":vintage2defaultCounts
    }]

    // insert zip
    map_data[0]["zip2wmo"] = zip2wmo

    // set background color
    d3.select("#svg-container")
      //.style("background-color",d3.hsl(66,0.72,0.85))
      //.style("background-color","#FFFFCC")
      //.style("background-color","#9ecae1")
      //.style("background-color","#ebf4f9")
      //.style("background-color",d3.rgb(158,202,225,0.10).toString())
      //.style("background-color",d3.rgb(0,0,0,0.10).toString())
      //.style("background-color",d3.rgb(253,208,162,0.40).toString())
      //.style("background-color",d3.rgb(109, 110, 113))
      .style("background-color",d3.rgb(43, 48, 51))
      //.style("background-color",d3.hsl(56,0.53,0.75))


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
      .call(cToggle);

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
    gLegend.change(change)
    // a container nested under svg
    var svg = d3.select("#viz-container")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", '0 0' +', '+ svg_width +', '+ svg_height)

    // add styling instance
    var style = Styling();
    // insert style
    svg.selectAll("#"+style.id())
      .data(map_data)
     .enter().append("g")
      .attr("id",style.id())
      .call(style);

    // create an instance of YearSlider
    var ySlider = YearSlider();
    ySlider.filterYear(startYear)
    ySlider.change(change)

    // create an instance of YearSlider
    var iHomes = Homes();
    iHomes.change(change);
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
    gLegend.choroplethScale(vMap.choroplethScale())//Does this need to update w/ year and units??????????
    legend.call(gLegend)
    //ySlider.width(gLegend.width())
    slider.call(ySlider)
    iHomes.filterYear(startYear)
    iHomes.choroplethScale(vMap.choroplethScale())//Does this need to update w/ year and units??????????
    home.call(iHomes)

      change.on("year_change",function(year){
        //update map color
        vMap.filterYear(year)
        //upadate smart default lines
        iHomes.filterYear(year)
        //update hover year
        gLegend.filterYear(year)
    })
      change.on("unit_change",function(units){
        //update map color
        vMap.units(units)
        //update legend scale
        gLegend.units(units)
        //update home lines
        iHomes.units(units)
    })
      change.on("opacity_change",function(){
        //update curve opacity for hover reset
        gLegend.curve_opacity(iHomes.curve_opacity())
    })
  }
}())
