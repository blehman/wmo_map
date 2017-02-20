function NewInput(){
  var div_id = "non-svg-elements"
    , container_id = "zipcode-form"
    , form_id = "zipForm"
    , input_id = "zip"
  var old_wmo;
  function chart(selection) {
    selection.each(function(data){
      console.log(data)
/*
      var form = d3.select(this)
       .append("form")
        .attr("id",form_id)
        .attr("onSubmit","return false;");
*/
      var text_input = d3.select(this).append("input")
        .attr("id",input_id)
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
        console.log(d)
        console.log("INPUT TEXT SUBMITTED")
        var zip = text_input.property("value")
        if (zip.length ==5){
          var wmo = d.zip2wmo[zip];
          console.log(zip)
          console.log(wmo)
          d3.selectAll("#"+"wmo_id_"+wmo).style("fill-opacity",0.50)
          console.log(old_wmo)
          if (old_wmo != wmo && old_wmo){
            d3.selectAll("#"+"wmo_id_"+old_wmo).style("fill-opacity",0.0)
          }
          old_wmo = wmo;
        }

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
  chart.form_id = function(f) {
    if (!arguments.length) { return form_id; }
    form_id = f;
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
/*
    <form name="myform" onSubmit="return zipcodeReview()">
      <input name="Submit" id="zip" type="text" placeholder="zipcode" />
      <!--<input type="text" id="myRadius" maxlength="" />-->
*/
