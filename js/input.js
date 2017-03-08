function NewInput(){
  var div_id = "non-svg-elements"
    , container_id = "zipcode-input"
    , input_id = "zip"
  var old_wmo;
  function chart(selection) {
    selection.each(function(data){
      var text_input = d3.select(this).append("input")
        .attr("id",input_id)
        .attr("x",100)
        .attr("type","text")
        .attr("placeholder","type a zipcode")
        .attr("maxlength",5)
        .attr("autofocus","autofocus")
        .attr("autocomplete","off")
        .on("keyup",color_map)
        .on("change",color_map)
        .on("cut", function() { setTimeout(color_map, 10); })
        .on("paste", function() { setTimeout(color_map, 10); });

      function color_map(d,i){
        d3.event.preventDefault()
        var zip = text_input.property("value")
        if (zip.length ==5){
          var wmo = d.zip2wmo[zip];
          d3.selectAll("#"+"wmo_id_"+wmo)
            .style("stroke-width","4.0px")
            .style("stroke","BLACK")
          if (old_wmo != wmo && old_wmo){
            d3.selectAll("#"+"wmo_id_"+old_wmo)
              .style("stroke-width","0.15px")
              .style("stroke","#999")
          }
          old_wmo = wmo;
        }else{
          d3.selectAll("#"+"wmo_id_"+old_wmo)
            .style("stroke-width","0.15px")
            .style("stroke","#999")
        }
      // end color_map
      }
  // selection end
    })
  // chart end
  }
  chart.div_id = function(d) {
    if (!arguments.length) { return div_id; }
    div_id = d;
    return chart;
  };
  chart.input_id = function(i) {
    if (!arguments.length) { return input_id; }
    input_id = i;
    return chart;
  };
  chart.container_id = function(i) {
    if (!arguments.length) { return container_id; }
    container_id = i;
    return chart;
  };
// NewInput end
  return chart
}
