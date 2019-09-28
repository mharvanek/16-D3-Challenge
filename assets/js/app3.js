var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(allData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(allData, d => d[chosenXAxis]) * 0.8,
      d3.max(allData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "In Poverty (%)";
  }
  else {
    var label = "Lacks Healthcare (%)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([0, 0])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv")
  .then(function(allData) {

    allData.forEach(function(data) {
      data.poverty = parseFloat(data.poverty);
      data.healthcare = parseFloat(data.healthcare);
      data.state = data.state;
     // console.log(data)
    });

  // xLinearScale function above csv import
  var xLinearScale = xScale(allData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(allData, d => d.healthcare)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(allData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Age");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");    
 

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

     //   console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(allData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        if (chosenXAxis === "age") {
          ageLabel
          .classed("active", true)
          .classed("inactive", false);
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);            

      }
        else if (chosenXAxis === "poverty") {
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);  
            
        }
        else {
          ageLabel
          .classed("active", false)
          .classed("inactive", true);
          povertyLabel
          .classed("active", false)
          .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);  
          
      }  
      }   
    });     
  });

  // var ylabelsGroup = chartGroup.append("g")
  //   .attr("transform", `translate(-20, ${height / 2})`);
    
  // var healthcarelabel = ylabelsGroup.append("text")
  //   .attr("x", -20)
  //   .attr("y", 0)
  //   .attr("transform", "rotate(-90)")
  //   .attr("value", "healthcare") // value to grab for event listener
  //   .classed("active", true)
  //   .text("Lacks Healthcare (%)");

  // var smokesLabel = ylabelsGroup.append("text")
  //   .attr("x", -40)
  //   .attr("y", 0)
  //   .attr("transform", "rotate(-90)")
  //   .attr("value", "smokes") // value to grab for event listener
  //   .classed("inactive", true)
  //   .text("Smokes (%)");

  // var obeseLabel = ylabelsGroup.append("text")
  //   .attr("x", -60)
  //   .attr("y", 0)
  //   .attr("transform", "rotate(-90)")
  //   .attr("value", "obese") // value to grab for event listener
  //   .classed("inactive", true)
  //   .text("Obese (%)");      

    //  // y axis labels event listener
    //  ylabelsGroup.selectAll("text")
    //  .on("click", function() {
    //    // get value of selection
    //    var value = d3.select(this).attr("value");
    //    if (value !== chosenYAxis) {
   
    //      // replaces chosenYAxis with value
    //      chosenYAxis = value;
   
    //   //   console.log(chosenYAxis)
   
    //      // functions here found above csv import
    //      // updates y scale for new data
    //      yLinearScale = yScale(allData, chosenYAxis);     
   
    //      // updates x axis with transition
    //      yAxis = renderAxes(yLinearScale, yAxis);
   
    //      // updates circles with new y values
    //      circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
   
    //      // updates tooltips with new info
    //      circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
   
    //      // changes classes to change bold text
    //      if (chosenYAxis === "healthcare") {
    //          healthcarelabel
    //          .classed("active", true)
    //          .classed("inactive", false);
    //          smokesLabel
    //          .classed("active", false)
    //          .classed("inactive", true);
    //          obeseLabel
    //          .classed("active", false)
    //          .classed("inactive", true);            
   
    //      }
    //      else if (chosenYAxis === "smoke") {
    //         healthcarelabel
    //          .classed("active", false)
    //          .classed("inactive", true);
    //          smokesLabel
    //          .classed("active", true)
    //          .classed("inactive", false);
    //          obeseLabel
    //          .classed("active", false)
    //          .classed("inactive", true);  
             
    //      }
    //    }
    //  });
