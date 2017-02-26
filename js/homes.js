function Homes(){

  var id = "homes";

  var height = 10
    , width = 500

  var posX = 85
    , posY = 450;

  function chart(selection) {
    selection.each(function(map_data) {

      var homes = d3.select("#"+id)
          .attr("transform","translate(740,85)");

      homes.insert("image",":first-child")
        .attr("class","green_home")
        .attr("xlink:href","img/noun_379386_cc.png")
        .attr("x",40)
        //.attr("y",85)
        .attr("opacity",0.90)
        .attr("width","60px")
      homes.insert("image",":first-child")
        .attr("class","green_home")
        .attr("xlink:href","img/noun_640195_cc.png")
        .attr("x",-60)
        .attr("y",8)
        .attr("opacity",0.90)
        .attr("width","48px")
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
