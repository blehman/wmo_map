function Homes(){

  var id = "homes";
  var change;

  var height = 10
    , width = 500
    , lineWidth = 100
    , multiplier=54.5
    , bar_height = multiplier *0.80;

  var posX = 85
    , posY = 450
    , box_side = 25;

  var filterYear="1980"
  , units = "KWH"
  , dispatch_updateSmartDefaultLines = d3.dispatch("updateSmartDefaultLines")

  var opacity_y
  , curve_opacity

  var choroplethScale;

  function chart(selection) {
    selection.each(function(map_data) {

      //console.log(map_data)
      var smart_default_domains = map_data["smartDefaults"];
      //console.log(smart_default_domains)
      var wmoVintage2smartDefaults = map_data["wmoVintage2smartDefaults"];
      var wmoVintage2energy = map_data["wmoVintage2energy"];
      var vintage2defaultCounts = map_data["vintage2defaultCounts"];
      var smartDefaultBars_yAxis = d3.scaleLinear()
          .domain([0,220])
          .range([1,bar_height])
      //console.log(vintage2defaultCounts)
      // create container for this section
      var homes = d3.select("#"+id)
          .attr("transform","translate("+((795/2)-150)+",100)");

      var opacity_slider = homes.append("g")
          .attr("transform","translate(-35,"+multiplier+")")
          .classed("opacity-slider",true);


      var line_path = d3.line()
          .x(d => d.x)
          .y(d=> d.y);

      var max_y = multiplier*5,
      slider_line_points = [{"x":0,"y":-40},{"x":0,"y":max_y}]

      // insert curves img
      /*
      var png_width = 50;
      opacity_slider.insert("image",":first-child")
          .attr("id","curves")
          .attr("xlink:href","img/curves.png")
          .attr("x",-png_width/2)
          .attr("y",max_y)
          .attr("opacity",1)
          .attr("width",png_width)
      // insert bars img
      opacity_slider.insert("image",":first-child")
          .attr("id","curves")
          .attr("xlink:href","img/bars.png")
          .attr("x",-png_width/2)
          .attr("y",-multiplier*0.43)
          .attr("opacity",1)
          .attr("width",png_width*0.80)
      */
      var os_line = opacity_slider
          .selectAll(".opacity-slider-line")
          .data([slider_line_points])
          .enter()
        .append("path")
          .classed("opacity-slider-line",true)
          .style("stroke","gray")
          .style("opacity","0.50")
          .style("stroke-width","0.50px")
          .attr("d",line_path);

      var os_curve_scale = d3.scalePow()
          .exponent(4)
          .domain([-35,max_y-box_side])
          .range([0.004,1]);
      var os_bar_scale = d3.scaleLinear()
          .domain([-35,max_y-box_side])
          .range([1,0.1]);

      opacity_y = max_y-box_side;
      curve_opacity = os_curve_scale(opacity_y);

      // build markers
      var defs = opacity_slider.append("defs");
      // create right arrow marker
      defs.append("marker")
        .attr("id", "oslider_arrow_right")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
       .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("stroke-width","2px")
        .style("fill",d3.rgb(255, 255, 255))
        .style("stroke",d3.rgb(255, 255, 255))
      // create right arrow
      opacity_slider.append("line")// attach a line
        .attr("id","oslider_arrow_right")
        .style("opacity",1)
        .attr("x1", 0)
        .attr("y1", opacity_y-3)
        .attr("x2", 0)
        .attr("y2", opacity_y-3.1)
        .attr("marker-end","url(#oslider_arrow_right)");
      // create left arrow marker
      defs.append("marker")
        .attr("id", "oslider_arrow_left")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
       .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .style("fill",d3.rgb(255, 255, 255))
        .style("stroke",d3.rgb(255, 255, 255))
      // create arrow
      opacity_slider.append("line")// attach a line
        .attr("id","oslider_arrow_left")
        .style("opacity",1)
        .attr("x1", 0)
        .attr("y1", opacity_y+3+box_side)
        .attr("x2", 0)
        .attr("y2", opacity_y+3.1+box_side)
        .attr("marker-end","url(#oslider_arrow_left)");

      //slider text
      opacity_slider.append("text")
        .attr("id","oslider_main_label")
        .classed("smartDefaultText oslider-labels",true)
        .style("fill",d3.rgb(255, 255, 255))
        .style("text-anchor","end")
        .attr("x",-box_side/2 - 2)
        .attr("y",opacity_y+box_side/2+2)
        .style("opacity",0)
        .text("opacity");
      // bars
      opacity_slider.append("text")
        .attr("id","oslider_bar_label")
        .classed("smartDefaultText oslider-labels",true)
        .style("fill",d3.rgb(255, 255, 255))
        .style("text-anchor","middle")
        .attr("x",0)
        .attr("y",-45)
        .attr("opacity",0)
        .text("bars: LEVEL%".replace("LEVEL",Math.round(os_bar_scale(opacity_y)*100)));
      // curves
      opacity_slider.append("text")
        .attr("id","oslider_curve_label")
        .classed("smartDefaultText oslider-labels",true)
        .style("fill",d3.rgb(255, 255, 255))
        .style("text-anchor","middle")
        .attr("x",0)
        .attr("y",max_y+box_side/2+2)
        .attr("opacity",0)
        .text("curves: LEVEL%".replace("LEVEL",Math.round(os_curve_scale(opacity_y)*100)));
      // build dragger
      d3.selectAll(".smartDefaultBars")
          .style("opacity",os_bar_scale(opacity_y))

      d3.selectAll(".lines path")
          .style("opacity",curve_opacity)

      var os_background_box = opacity_slider
          .append("rect")
          //.attr("id","opacity-slider-drag")
          .attr("id","opacity-background-box")
          .attr("class","slider-box")
          .style("fill","white")
          .style("rx","5px")
          .attr("width",box_side)
          .attr("height",box_side)
          .attr("x",-box_side/2)
          .attr("y",opacity_y);

      var os_inner_box = opacity_slider
          .append("rect")
          //.attr("id","opacity-slider-drag")
          .attr("id","opacity-inner-box")
          .attr("class","slider-box")
          .style("fill","none")
          .style("stroke","green")
          .style("stroke-width","6px")
          .style("rx","1px")
          .style("opacity",0.00)
          .attr("width",box_side*0.60)
          .attr("height",box_side*0.60)
          .attr("x",(-box_side/2)*0.60)
          .attr("y",opacity_y+5)
          .style("cursor","pointer");

      var os_box = opacity_slider
          .append("rect")
          .attr("id","opacity-slider-drag")
          .attr("class","slider-box")
          //.style("fill","red")
          .attr("width",box_side)
          .attr("height",box_side)
          .attr("x",-box_side/2)
          .attr("y",opacity_y);

      var os_small_inner_box = opacity_slider
          .append("rect")
          //.attr("id","opacity-slider-drag")
          .attr("id","opacity-small-inner-box")
          .attr("class","slider-box")
          .style("fill",d3.rgb(255, 255, 255))
          .style("stroke","black")
          .style("stroke-width","1px")
          .style("rx","2px")
          .style("opacity",1.0)
          .attr("width",box_side*0.40)
          .attr("height",box_side*0.40)
          .attr("x",(-box_side/2)*0.40)
          .attr("y",opacity_y+7)
          .style("cursor","pointer");

      var os_invisible_box = opacity_slider
          .append("rect")
          .attr("id","invisible-slider-box")
          .attr("class","invisible-slider-box")
          //.style("fill","red")
          .attr("width",box_side)
          .attr("height",box_side)
          .attr("x",-box_side/2)
          .attr("y",opacity_y)
          .style("fill","red")
          .style("cursor","pointer")
          //.style("fill",d3.rgb(255, 255, 255))
          .attr("opacity",0.00)
          .call(d3.drag()
            .on("start",dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

      function dragstarted(d) {
        d3.select("#opacity-inner-box").style("opacity",0.50);
        d3.select(".oslider-labels").style("opacity",1);
        d3.select("#oslider_bar_label").style("opacity",1);
        d3.select("#oslider_curve_label").style("opacity",1);
      }

      function dragged(d) {
        opacity_y = d3.max([-35, d3.min([d3.event.y,max_y-box_side])]);
        curve_opacity = os_curve_scale(opacity_y)
        //log_y_value = Math.exp(y_value);
        // change value of invisible slider rect
        d3.select(this).attr("y", d.y = opacity_y);

        d3.selectAll("#lines path")
          .style("opacity",curve_opacity)

        d3.selectAll(".smartDefaultBars")
          .style("opacity",os_bar_scale(opacity_y))

        d3.selectAll("#oslider_main_label")
          .attr("y",opacity_y+box_side/2+2)

        d3.selectAll("#oslider_arrow_right")
          .attr("y1",opacity_y-3)
          .attr("y2",opacity_y-3.1);
        d3.selectAll("#oslider_arrow_left")
          .attr("y1",opacity_y+box_side+3)
          .attr("y2",opacity_y+box_side+3.1);
        d3.selectAll("#opacity-slider-drag")
          .attr("y",opacity_y);
        d3.selectAll("#opacity-background-box")
          .attr("y",opacity_y);
        d3.selectAll("#opacity-inner-box")
          .attr("y",opacity_y+5);
        d3.selectAll("#opacity-small-inner-box")
          .attr("y",opacity_y+7);
        d3.selectAll("#oslider_bar_label")
          .text("bars: LEVEL%".replace("LEVEL",Math.round(os_bar_scale(opacity_y)*100)));
        d3.selectAll("#oslider_curve_label")
          .text("curves: LEVEL%".replace("LEVEL",Math.round(os_curve_scale(opacity_y)*100)));

      }

      function dragended(d) {
        //d3.select(this).style("fill", d3.rgb(0,0,0,0.50));
        d3.select(".oslider-labels").style("opacity",0);
        d3.select("#opacity-inner-box").style("opacity",0);
        d3.select("#oslider_bar_label").style("opacity",0);
        d3.select("#oslider_curve_label").style("opacity",0);
      }
/*
      // opacity slider text
      var opacitySliderBarsText = opacity_slider
          .append("text")
          .attr("transform","translate(0,"+-25+")")
          .classed("opacitySliderText",true)
          .attr("text-anchor","middle")
          .style("fill",d3.rgb(0,0,0,0.50))
          .text("Total Regions per Efficiency Bucket");

      var opacitySliderCurvesText = opacity_slider
          .append("text")
          .attr("transform","translate(0,"+multiplier*6.6+")")
          .classed("opacitySliderText",true)
          .attr("text-anchor","middle")
          .style("fill",d3.rgb(0,0,0,0.50))
          .text("Regional Efficiency Profile");
*/
      // Smart Default Legend
      var legendScale = d3.scaleOrdinal()
          .domain(["less","more"])
          .range([0,lineWidth]);

      var smartDefaultLegend = homes.append("g")
          .attr("id","smart-default-legend")
          .classed("smartDefaultText",true)
          .attr("transform","translate(0,"+-30+")");

      var smartDefaulLegendText = smartDefaultLegend
          .append("text")
          .attr("transform","translate(-5,"+-15+")")
          .classed("heading",true)
         //.attr("x",20)
         //.attr("y",1)
          //.attr("fill","black")
          .style("fill",d3.rgb(255, 255, 255))
          .text("Efficiency");

      var legendRectLarge = smartDefaultLegend.append("rect")
          .attr("id","smart-default-legend-background")
          .classed("background-rect",true)
          .attr("width",lineWidth)
          .attr("y",45)
          .attr("height",317)
          .attr("fill",d3.rgb(255, 255, 255))
          .attr("opacity",0.05)

      var legendRectSmall = smartDefaultLegend.append("rect")
          .attr("id","smart-default-legend-background")
          .classed("background-rect",true)
          .attr("width",lineWidth)
          .attr("height",10)
          .attr("fill",d3.rgb(255, 255, 255))
          .attr("opacity",0.05)
      var smartDefaultLegendAxis = smartDefaultLegend
          .call(d3.axisBottom(legendScale).ticks(1))

      var smartDefaultScales = {};

      var smartDefaultNames = [
        "roofConstructionName"
        , "windowConstructionName"
        , "wallConstructionName"
        , "floorConstructionName"
        , "infiltration"
        , "setup-home-sqft"];

      var smartDefaultTxt = {
        "roofConstructionName":
          ["* R-value is the insulation rating"
            , "* X-axis is roof efficiency (R13-R40)"
            , "* Bar heights are counts of regions"]
        , "windowConstructionName":
          ["* R-value is the insulation rating"
            , "* X-axis is glass efficiency (R7-R19)"
            , "* Bar heights are counts of regions"]
        , "wallConstructionName":
          ["* R-value is the insulation rating"
            , "* X-axis is wall efficiency (R7-R19)"
            , "* Bar heights are counts of regions"]
        , "floorConstructionName":
          ["* R-value is the insulation rating"
            , "* X-axis is floor efficiency (R13-R19)"
            , "* Bar heights are counts of regions"]
        , "infiltration":
          ["* Flow rate of outside air into home"
            , "* X-axis is home efficiency (1.25-0.0)"
            , "* Bar heights are counts of regions"]
        , "setup-home-sqft":
          ["* Larger homes are less efficient"
            , "* X-axis is home sqft (5,000-1,000)"
            , "* Bar heights are counts of regions"]
      };


      var smartDefaultLabels = [
        "Roof R-value"
        , "Window R-value"
        , "Wall R-value"
        , "Floor R-value"
        , "Leakiness Score"
        , "Size Efficiency"
        ];

      var hover_text_boxes = homes.append("g")
          .attr("id","hover-boxes",true)
          .attr("transform","translate(-45,-160)");

      var txt_box = hover_text_boxes
          .append("rect")
          .classed("hover-rect",true)
          .attr("width",252)
          .attr("height",55)
          .style("opacity",0.0)
          .style("rx","5px")
          .style("stroke",d3.rgb(255, 255, 255))
          .style("stroke-width",0.25)
          .style("fill",d3.rgb(255,69,0));

      smartDefaultNames.forEach(function(d,i){
/*
        var s1 = d3.scaleOrdinal()
          .domain(smart_default_domains[d])
          .range(d3.range(0,smart_default_domains[d].length));

        var s2 = d3.scaleLinear()
          .domain(d3.extent(s1.range()))
          .range([0,lineWidth]);
*/
        //console.log(smart_default_domains[d])
        var band = d3.scaleBand()
          .domain(smart_default_domains[d])
          .range([0,lineWidth])

        //smartDefaultScales[d] = {"ordinal":s1,"linear":s2,"band":band};
        smartDefaultScales[d] = {"band":band};

        //create texts for hovering on the value
        hover_text_boxes.selectAll("#hover-text-"+d)
          .data(smartDefaultTxt[d])
         .enter().append("text")
          .attr("class","hover-text-"+d)
          .text(d => d)
          .classed("hover-text",true)
          .attr("x",2)
          .attr("y",function(d,i) {return 15+15*i})
          .style("opacity",0)
          .style("fill",d3.rgb(255, 255, 255))

      })
      // add axes
      homes.selectAll(".pointPlots")
        .data(smartDefaultNames)
       .enter().append("g")
        .attr("id",d=>"scale_"+d)
        .attr("class","pointPlots domain")
        //.style("fill","black")
        .each(function(d,i){
          var gAxis = d3.select("#"+"scale_"+d)
            .attr("transform","translate(0,"+((i+1)*multiplier)+")");
          //var gScale = smartDefaultScales[d]["linear"];
          var gScale = smartDefaultScales[d]["band"];
          gAxis.call(d3.axisBottom(gScale).ticks(3))
        });
      // remove all the axes ticks & labels
      d3.selectAll(".pointPlots .tick").remove()
      // add text to axes
      homes.selectAll(".pointPlotLabels")
        .data(smartDefaultLabels)
       .enter().append("text")
        .classed("smartDefaultText",true)
        .attr("id",d => "text_"+d)
        .style("fill",d3.rgb(255, 255, 255))
        .attr("transform",function(d,i){return "translate(108,"+(((i+1)*multiplier))+")";})
        .text(d=>d);
      // add circels to axes
        // tbd
      // add lines to axes
      function updateSmartDefaultLines(){
        // remove all lines
        homes.selectAll("#lines").remove();
        var homeLines = homes.append("g").attr("id","lines");
        Object.keys(wmoVintage2smartDefaults).filter(d=>+d.split(", ")[1].replace(")","")==filterYear).map(function(key){
          var s = key.split(", ")
            , wmo = s[0].replace("(","")
            , year = s[1].replace(")","");
          // each home feature has one (name,value) as a point on each scale
          var sd = wmoVintage2smartDefaults[key];
          // create a line function for each wmoVintage combo
          var line = d3.line()
              .x(function(d,i){
                //var ordinal_value = smartDefaultScales[d.name]["ordinal"](d.value);
                //var linear_value =  smartDefaultScales[d.name]["linear"](ordinal_value);
                //return linear_value;
                var band_width = smartDefaultScales[d.name]["band"].bandwidth();
                var line_x_value =  smartDefaultScales[d.name]["band"](d.value);
                var bar_midpoint = line_x_value + (band_width/2);
                return bar_midpoint;

              })
              .y(function(d,i){return (i+1)*multiplier})
              //.curve(d3.curveCardinal.tension(0.5));
              //.curve(d3.curveBundle.beta(1));
              .curve(d3.curveCatmullRom.alpha(1));
          // Draw line
          homeLines.selectAll(".sd_lines_"+wmo+"_"+year)
            .data([sd])
            .enter().append("path")
            .classed("sd_lines_"+wmo+"_"+year,true)
            .attr("d",line)
            .attr("fill","none")
            .attr("stroke",choroplethScale(wmoVintage2energy[key][units]))
            .attr("stroke-width",0.25)
            .style("opacity",os_curve_scale(opacity_y))

        // end mapping for lines
        })

        // BUILD BARS
        d3.selectAll(".smartDefaultBars").remove()
        var bars = homes.append("g")
          .classed("bars",true);

        var hoverRects = homes.append("g")
          .attr("id","hover-rects");


        smartDefaultNames.map(function(default_name,i){
          var data = vintage2defaultCounts["year"+filterYear][default_name];
          // make rects
          bars.selectAll("."+default_name+"-bars")
            .data(data)
           .enter().append("rect")
            .attr("class",default_name+"-bars")
            .classed("smartDefaultBars",true)
            .attr("x",function(d,i){
              //var ordinal_value = smartDefaultScales[default_name]["ordinal"](d.value);
              //var linear_value =  smartDefaultScales[default_name]["linear"](ordinal_value);
              //return linear_value
              var line_x_value =  smartDefaultScales[default_name]["band"](d.name);
              return line_x_value;
            })
            //.attr("y",d => (1+i)*multiplier)
            .attr("y",d => (1+i)*multiplier-smartDefaultBars_yAxis(d.count))
            .attr("width",d => smartDefaultScales[default_name]["band"].bandwidth())
            .attr("height",d => smartDefaultBars_yAxis(d.count))
            .attr("fill","gray")
            .attr("stroke","white")
            .attr("stroke-width","0.25px")
            .attr("opacity",os_bar_scale(opacity_y));

          // HOVER action;
          hoverRects.append("rect")
            .classed("face-hover-rect "+default_name,true)
            .attr("x",0)
            .attr("y",multiplier*i)
            .attr("width",215)
            .attr("height",multiplier)
            .style("fill",d3.rgb(255, 255, 255))
            .style("opacity",0.0)
            .style("cursor","pointer")
            .on("mouseover",function(){
                d3.selectAll(".hover-text-"+default_name)
                  .style("opacity",1);
                d3.selectAll(".hover-rect")
                  .style("opacity",0.10);
            })
            .on("mouseout",function(){
                d3.selectAll(".hover-text-"+default_name)
                  .style("opacity",0);
                d3.selectAll(".hover-rect")
                  .style("opacity",0);
            })
        })
        //vintage2defaultCounts[year]
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
  chart.opacity_y = function(o) {
    if (!arguments.length) { return opacity_y; }
    opacity_y = o;
    return chart;
  };
  chart.curve_opacity = function(c) {
    if (!arguments.length) { return curve_opacity; }
    curve_opacity = c;
    return chart;
  };
  chart.change = function(c) {
    if (!arguments.length) { return change; }
    change = c;
    return chart;
  };

  // end Homes
  return chart
}
