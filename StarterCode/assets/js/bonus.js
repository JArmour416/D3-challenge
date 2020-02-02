var svgWidth = 960;
var svgHeight = 500;
var margin = {
    top: 60,
    right: 60,
    bottom: 120,
    left: 150
};

var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart and shift the latter by left and top margins
var svg = d3.select(".chart")
    .append("svg")
    .classed("chart", true)
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Load data from data.csv
d3.csv("assets/data/data.csv").then((data, error) => {
    if (error) throw error;

    // Parse data: Cast the data values to a number
    data.forEach(d => {
      d.poverty = +d.poverty;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      d.smokes = +d.smokes;
    });

// Chart Group
var chartGroup = svg.append("g")
    .attr("tranform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var healthData = null;
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
var xAxisLabels = ["poverty", "age", "income"];
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)",
                    "age": "Age (Median)",
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)",
                    "smokes": "Smokes (%)",
                    "healthcare": "Lacks Healthcare (%)"};
var axisPadding = 20;

// Function used for updating x-scale var upon click on axis label
function scale (healthData, chosenAxis, xy) {
    var axisRange = (xy === "x") ? [0, chartWidth]:[chartHeight, 0]

    // Create x scale function
    var linearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenAxis])*0.8,
          d3.max(healthData, d => d[chosenAxis])*1.2])
        .range(axisRange);
    
        return linearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderAxis(newScale, Axis, xy) {
    var posAxis = (xy === "x") ? d3.axisBottom(newScale):d3.axisLeft(newScale)

    Axis.transition()
        .duration(1000)
        .call(posAxis);

    return Axis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(elemEnter, newScale, chosenAxis, xy) {
    elemEnter.selectAll("circle")
        .transition()
        .duration(1000)
        .attr(`c${xy}`, d => newScale(d[chosenAxis]));

    elemEnter.selectAll("text")
        .transition()
        .duration(1000)
        .attr(`d${xy}`, d => newScale(d[chosenAxis]));

    return elemEnter;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, elemEnter) {
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8,0])
        .html(d => `${d.state} <br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}: ${d[chosenYAxis]}`);

    svg.call(tool_tip);

    // Assign hover events
    elemEnter.classed("active inactive", true)
    .on('mouseover', tool_tip.show)
    .on('mouseout', tool_tip.hide);

    return elemEnter;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, elemEnter) {
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d => `${d.state} <br>${chosenXAxis}: ${d[chosenXAxis]} <br>${chosenYAxis}:${d[chosenYAxis]}`);

    svg.call(tool_tip);

    // Assign hover events
    elemEnter.classed("active inactive", true)
    .on('mouseover', tool_tip.show)
    .on('mouseout', tool_tip.hide);

    return elemEnter;
}

// Function update the scatter chart based on the selected axis label change
function updateChart() {
    var value = d3.select(this).attr("value");
    var xy = xAxisLabels.includes(value) ? "x":"y";
    var elemEnter = d3.selectAll("#elemEnter");

    var axis = (xy === "x") ? d3.select("#xAxis"):d3.select("#yAxis");
    chosenAxis = (xy === "x") ? chosenXAxis:chosenYAxis;

    if (value !== chosenAxis) {
        if(xy === "x") {
            chosenXAxis = value;
        }
        else {
            chosenYAxis = value;
        };

        // Update new chosen information
        chosenAxis = (xy === "x") ? chosenXAxis:chosenYAxis;
        linearScale = scale(healthData, chosenAxis, xy);
        axis = renderAxis(linearScale, axis, xy);
        elemEnter = renderCircles(elemEnter, linearScale, chosenAxis, xy);
        elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);

        // Parse through the chosen Axis Labels 
        axisLabels = (xy === "x") ? xAxisLabels:yAxisLabels
        axisLabels.forEach(label => {
            if(label === value) {
                d3.select(`[value=${label}]`).classed("active", true);
                d3.select(`[value=${label}]`).classed("inactive", false);
                d3.select(`[value=${xy+label}]`).classed("invisible", true);
            }
            else { 
                d3.select(`[value=${label}]`).classed("active", false);
                d3.select(`[value=${label}]`).classed("inactive", true);
                d3.select(`[value=${xy+label}]`).classed("invisible", false);
            }
        });
    };    
}

// function updates the axis labels tooptip on the rect tag
function updateLabelsTooltip(xy, labelEnter) {
    xy = (xy === "x") ? "y":"x";
    var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(d => `Move ${d} to ${xy}-axis`);
    
    svg.call(tool_tip);
    labelEnter.classed("active inactive", true)
    .on('mouseenter', tool_tip.show)
    .on('mouseleave', tool_tip.hide)
    .on('mousedown', tool_tip.hide);

    return labelEnter;
}

// function updates the rect tag into axis label group
function updateLabelsRect(xy, xPos, labelsRect) {
    var squareSize = 12;
    var chosenAxis = (xy === "x") ? chosenXAxis : chosenYAxis;
    var enterlabelsRect = null;

    // Append rect tag
    enterlabelsRect = labelsRect.enter()
        .append("rect")
        .merge(labelsRect)
        .attr("x", xPos)
        .attr("y", (_d,i) => (i+1)*axisPadding-squareSize)
        .attr("width", squareSize)
        .attr("height", squareSize)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenAxis) ? true:false)
        .attr("value", d => xy+d)
        .on("click", updateLabel);;

    // Return enter to be able to append tooltip
    return enterlabelsRect;
}

// function updates the text tag into axis label group
function updateLabelsText(xy, xPos, labelsText) {
    var chosenAxis = (xy === "x") ? chosenXAxis : chosenYAxis;
    labelsText.enter()
        .append("text");
    
    enterlabelsText = labelsText.enter()
        .append("text")
        .merge(labelsText)
        .attr("x", xPos)
        .attr("y", (_d, i) => (i+1)*axisPadding)
        .attr("value", d => d) 
        .classed("active", d => (d === chosenAxis) ? true:false)
        .classed("inactive", d => (d === chosenAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);
}

// function updates the axis labels after moving one of the axes
function updateLabel() {
    // get move value of selection and slice it for the xy axis and axis label value
    var moveLabel = d3.select(this).attr("value");
    var oldAxis = moveLabel.slice(0,1);
    var selectedLabel = moveLabel.slice(1);

    // Move axis label to the other axis
    if (oldAxis === "x") {
        xAxisLabels = xAxisLabels.filter(e => e !== selectedLabel);
        yAxisLabels.push(selectedLabel);
    } 
    else {
        yAxisLabels = yAxisLabels.filter(e => e !== selectedLabel);
        xAxisLabels.push(selectedLabel);
    }

    // Update group for x axis labels group of rect + text
    var xLabels = d3.select("#xLabels");
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels);

    xEnterLabelsRect = updateLabelsRect("x", -120, xLabelsRect);

    // update tooptip on rect
    updateLabelsTooltip("x", xEnterLabelsRect);

    // Remove old labels rect
    xLabelsRect.exit().remove();

    // append the text for the x-axis labels
    var xLabelsText = xLabels.selectAll("text")
        .data(xAxisLabels);

    // update labels text
    updateLabelsText("x", 0, xLabelsText);

    // Remove any excess old data
    xLabelsText.exit().remove();

    // Update group for y axis labels group of rect + text
    var yLabels = d3.select("#yLabels");

    // append the rect for move labels
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels)

    yEnterLabelsRect = updateLabelsRect("y", -45, yLabelsRect);

    // update tooptip on rect tags
    updateLabelsTooltip("y", yEnterLabelsRect);

    // remove old labels rect tags
    yLabelsRect.exit().remove();

    // append the text for the x-axis labels
    var yLabelsText = yLabels.selectAll("text")
        .data(yAxisLabels);
    updateLabelsText("y", margin.top, yLabelsText);

    // Remove any excess old data
    yLabelsText.exit().remove();
}

// function initialize the chart elements
function init() {

    // variable radius for circle
    var r = 10;

    // Create initial xLinearScale, yLinearScale
    var xLinearScale = scale(healthData, chosenXAxis, "x");
    var yLinearScale = scale(healthData, chosenYAxis, "y");

    // Create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);



    // Define the data for the circles + text
    var elem = chartGroup.selectAll("g circle")
        .data(healthData);

    // Create and place the "blocks" containing the circle and the text  
    var elemEnter = elem.enter()
        .append("g")
        .attr("id", "elemEnter");
    
    // Create the circle for each block
    elemEnter.append("circle")
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d[chosenYAxis]))
        .attr('r', r)
        .classed("stateCircle", true);

    // Create the text for each circle
    elemEnter.append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]))
        .classed("stateText", true)
        .attr("font-size", parseInt(r*0.8))
        .text(d => d.abbr);

    // Create group for xLabels: x-axis label
    var xLabels = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`)
        .classed("atext", true)
        .attr("id", "xLabels");

    // Create rect for x-axis move label
    var xLabelsRect = xLabels.selectAll("rect")
        .data(xAxisLabels)

    var enterXLabelsRect = xLabelsRect.enter()
        .append("rect")
        .attr("x", -120)
        .attr("y", (_d, i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenXAxis) ? true:false)
        .attr("value", d => "x"+d)
        .on("click", updateLabel);

    // update tooptip on rect

    updateLabelsTooltip("x", enterXLabelsRect);

    // Create text of the x-axis label
    xLabels.selectAll("text")
        .data(xAxisLabels)
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", (_d,i) => (i+1)*axisPadding)
        .attr("value", d => d) // value to grab for event listener
        .classed("active", d => (d === chosenXAxis) ? true:false)
        .classed("inactive", d => (d === chosenXAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // Create group for yLabels: y-axis labels
    var yLabels = chartGroup.append("g")
        .attr("transform", `rotate(-90 ${(margin.left/2)} ${(chartHeight/2)+60})`)
        .classed("atext", true)
        .attr("id", "yLabels");

    // Create rect for y-axis move label
    var yLabelsRect = yLabels.selectAll("rect")
        .data(yAxisLabels);

    var enterYLabelsRect = yLabelsRect.enter()
        .append("rect")
        .attr("x", -45)
        .attr("y", (_d,i) => (i+1)*axisPadding-12)
        .attr("width", 12)
        .attr("height", 12)
        .classed("stateRect", true)
        .classed("invisible", d => (d === chosenYAxis) ? true:false)
        .attr("value", d => "y"+d)
        .on("click", updateLabel);
    updateLabelsTooltip("y", enterYLabelsRect);

    // Create text of the y-axis label
    yLabels.selectAll("text")
        .data(yAxisLabels)
        .enter()
        .append("text")
        .attr("x", margin.top)
        .attr("y", (_d,i) => (i+1)*axisPadding)
        .attr("value", d => d) 
        .classed("active", d => (d === chosenYAxis) ? true:false)
        .classed("inactive", d => (d === chosenYAxis) ? false:true)
        .text(d => labelsTitle[d])
        .on("click", updateChart);

    // updateToolTip function
    var elemEnter = updateToolTip(chosenXAxis, chosenYAxis, elemEnter);
};

    // Load data into healthData
    healthData = data;
    init();
});

