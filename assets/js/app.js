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

// Initial Chosen Axes
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

// function used for updating y-scale var upon click on axis label
function yScale(allData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(allData, d => d[chosenYAxis]) * 0.8,
      d3.max(allData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderNewXCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function renderNewYCircles(circlesGroup, newYScale, chosenYaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Median Age";
  }
  else if (chosenXAxis === "income") {
    var xlabel = "Income";
  };

  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes (%)";
  }
  else {
    var ylabel = "Obese (%)";
  };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([0, 0])
    .html(function(d) {
      return (`State: ${d.abbr}<br>${xlabel}: ${d[chosenXAxis]} <br>${ylabel}: ${d[chosenYAxis]}`);
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
      data.age = parseFloat(data.age);
      data.healthcare = parseFloat(data.healthcare);
      data.income = parseFloat(data.income);
      data.smokes = parseFloat(data.smokes);
      data.obesity = parseFloat(data.obesity);
      data.state = data.state;
    });

      // xLinearScale function above csv import
  var xLinearScale = xScale(allData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(allData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  //append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(allData)
    .enter()
    .append("circle")
    .text(d => (d.abbr))
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis] * .98))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".7")

  // Append Text to Circles
  // var textGroup = chartGroup.selectAll(".stateText")
  //     .data(allData)
  //     .enter()
  //     .append("text")
  //     .attr("x", d => xLinearScale(d[chosenXAxis]))
  //     .attr("y", d => yLinearScale(d[chosenYAxis] * .98))
  //     .text(d => (d.abbr))
  //     .attr("class", "stateText")
  //     .attr("font-size", "8px")
  //     .attr("text-anchor", "middle")
  //     .attr("fill", "white");      
      
  // Create group for x axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(-25, ${height / 2})`);    

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Age");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");  

  var healthcarelabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -20)
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -40)
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("transform", "rotate(-90)")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");     


  // updateToolTip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

//      console.log(chosenXAxis)

        xLinearScale = xScale(allData, chosenXAxis);     

        // updates x axis with transition
        xAxis = renderxAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderNewXCircles(circlesGroup, xLinearScale, chosenXAxis);
        textGroup = renderNewXCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
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
        else if (chosenXAxis === "income") {
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
  
      

     // y axis labels event listener
     ylabelsGroup.selectAll("text")
     .on("click", function() {
       // get value of selection
       var yvalue = d3.select(this).attr("value");
       if (yvalue !== chosenYAxis) {
   
         // replaces chosenYAxis with value
         chosenYAxis = yvalue;
   
         console.log(chosenYAxis)
   
         // updates y scale for new data
         yLinearScale = yScale(allData, chosenYAxis);     
   
         // updates y axis with transition
         yAxis = renderyAxes(yLinearScale, yAxis);
   
        //  updates circles with new y values
         circlesGroup = renderNewYCircles(circlesGroup, yLinearScale, chosenYAxis);
   
        //  // updates tooltips with new info
         circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
   
         // changes classes to change bold text
         if (chosenYAxis === "healthcare") {
             healthcarelabel
             .classed("active", true)
             .classed("inactive", false);
             smokesLabel
             .classed("active", false)
             .classed("inactive", true);
             obeseLabel
             .classed("active", false)
             .classed("inactive", true);            
   
         }
         else if (chosenYAxis === "smokes") {
            healthcarelabel
             .classed("active", false)
             .classed("inactive", true);
             smokesLabel
             .classed("active", true)
             .classed("inactive", false);
             obeseLabel
             .classed("active", false)
             .classed("inactive", true);  
             
         }
         else if (chosenYAxis === "obesity") {
          healthcarelabel
          .classed("active", false)
          .classed("inactive", true);
          smokesLabel
          .classed("active", false)
          .classed("inactive", true);
          obeseLabel
          .classed("active", true)
          .classed("inactive", false);  
          
      }                
       }
     });


});
