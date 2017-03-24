function Styling(){

  var id = "styling";


  function chart(selection) {
    selection.each(function(data) {
      //var wmoVintage2energy = data["wmoVintage2energy"]
      //var wmoVintage2smartDefaults = data["wmoVintage2smartDefaults"]

      // MARGIN LINES
      var styling = d3.select(this)
/*
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,60L900,60")
          .attr("stroke","pink");

      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,110L900,110")
          .attr("stroke","pink");

      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,140L900,140")
          .attr("stroke","pink");

      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,160L900,160")
          .attr("stroke","pink");

      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,210L900,210")
          .attr("stroke","yellow");
     var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,240L900,240")
          .attr("stroke","yellow");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,260L900,260")
          .attr("stroke","black");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,290L900,290")
          .attr("stroke","black");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,310L900,310")
          .attr("stroke","black");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,600L900,600")
          .attr("stroke","red");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M85,650L900,650")
          .attr("stroke","red");
      var margin_line = styling
          .append("g")
          .classed("margin-line",true)
          .append("path")
          .attr("d","M650,100L650,650")
          .attr("stroke","red");
*/
      //rectangle
      var title_rect = styling.append("g")
          .attr("id","title-rect")
         .append("rect")
          .attr("x",70)
          .attr("y",30)
          .attr("width",860)
          .attr("height",60)
          .style("fill",d3.rgb(109, 110, 113))
          .style("rx",5)
    //end selection
    })
  // end chart
  }
  chart.id = function(i) {
    if (!arguments.length) { return id; }
    id=i;
    return chart;
  };

// end GradientLegend
  return chart
}
