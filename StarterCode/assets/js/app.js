var svgWidth = 960;
var svgHeight = 500;
var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart and shift the latter by left and top margins
var svg = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Chart Group
var chartGroup = svg.append("g")
    .attr("tranform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function(healthData) {

    // Parse Data and cast as numbers
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        //console.log(data.state, data.abbr, data.poverty, data.healthcare)
    });

    // Create x scale function
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d.poverty)*0.9,d3.max(healthData, d => d.poverty)*1.1])
        .range([0, width]);
    
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)*1.1])
        .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .style("font-size", "18px")
        .call(bottomAxis);
    
    chartGroup.append("g")
        .style("font-size", "18px")
        .call(leftAxis);

// Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".5");

// Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "toolTip")
        .html(function(d) {
            return (`${d.state}<br>Poverty : ${d.poverty}<br>Healthcare: ${d.healthcare}`);
        });
// Create tooltip in the chart
        chartGroup.on("click", function(data) {
    // Create event listeners to display and hide the tooltip
            toolTip.show(data, this);
        })
        // onmouseout event
            .on("mouseout", function(data) {
                toolTip.hide(data);
            })
// Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 30 - margin.left)
            .attr("x", 0 - (height/2))
            .attr("dy", "1em")
            .classed("aText", true)
            .text("Lacks Healthcare (%)");
            

        chartGroup.append("text")
            .attr("y", height + margin.bottom/2-10)
            .attr("x", width/2)
            .attr("dy", "1em")
            .classed("aText", true)
            .text("In Poverty (%)");
}).catch(function(error) {
    console.log(error);
})
