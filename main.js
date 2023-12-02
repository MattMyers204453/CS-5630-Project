import { getData } from './data.js';

let data = [];
let first20 = [];
let yAxisToShow = "subscribers";
const HORIZONTAL_MARGIN = 150;
const VERTICAL_MARGIN = 150;
const CHART_WIDTH = 1000;
const CHART_HEIGHT = 500;
const ANIMATION_DURATION = 500;

await main();
setup();

async function main() {
    data = await getData();
    console.log(data);
    first20 = data.filter((row) => {
        return row.rank < 21;
    });
}

function setup() {
    let svg = d3.select("#barchart-div")
        .append("svg")
        .attr("width", CHART_WIDTH + HORIZONTAL_MARGIN * 2)
        .attr("height", CHART_HEIGHT + VERTICAL_MARGIN * 2)
        .append("g")
        .attr("transform", "translate(" + HORIZONTAL_MARGIN + "," + 10 + ")");


    // Left text for chart
    svg.append("text")
        .classed("left-text", true)
        .attr("x", "0")
        .attr("y", "250")
        .text("Subscribers")
        .attr("transform", "translate(-365, 350)rotate(270)");

    // Bottom text for Channel names
    svg.append("text")
        .classed("bottom-text", true)
        .attr("x", CHART_WIDTH / 2 - 50)
        .attr("y", CHART_HEIGHT + VERTICAL_MARGIN - 25)
        .text("Channel Name");
    // This is for individual channels
    let groups = d3.map(first20, (row) => {
        return row.Youtuber;
    })

    console.log(groups);
    let xScale = d3.scaleBand()
        .domain(groups)
        .range([0, CHART_WIDTH])
        .padding([0.2]);

    // This is for individual bars (add other numerical values)
    let subgroups = ["subscribers", "video views", "uploads"];

    // Colors for the bars, change/add to these
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#377eb8", "#e41a1c", "#FFFF00"])

    let xSubGroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, xScale.bandwidth()])
        .padding([0.05]);

    // Y-Axis for subscribers
    let maxYSubscribers = d3.max(first20, first20 => +first20.subscribers);
    console.log(maxYSubscribers);
    let yScaleSubscribers = d3.scaleLinear()
        .domain([0, maxYSubscribers])
        .range([CHART_HEIGHT, 0]);

    svg.append("g")
        .attr("id", "y-axis-subscribers")
        .call(d3.axisLeft(yScaleSubscribers));

    // Y-Axis for video views
    let maxYVideoViews = d3.max(first20, first20 => +first20["video views"]);
    console.log(maxYVideoViews);
    let yScaleVideoViews = d3.scaleLinear()
        .domain([0, maxYVideoViews])
        .range([CHART_HEIGHT, 0]);

    svg.append("g")
        .classed("hidden", true)
        .attr("id", "y-axis-video-views")
        .call(d3.axisLeft(yScaleVideoViews));

    // Y-Axis for number of uploads
    let maxYUploads = d3.max(first20, first20 => + first20["uploads"]);
    console.log(maxYUploads);
    let yScaleUploads = d3.scaleLinear()
        .domain([0, maxYUploads])
        .range([CHART_HEIGHT, 0]);

    svg.append("g")
        .classed("hidden", true)
        .attr("id", "y-axis-uploads")
        .call(d3.axisLeft(yScaleUploads));


    svg.append("g")
        .classed("x-scale", true)
        .attr("transform", "translate(0," + CHART_HEIGHT + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-70)");

    // Making bar chart with subgroups of individual bars
    console.log(xScale.bandwidth());
    console.log(xSubGroup.bandwidth());
    svg.append("g")
        .selectAll("g")
        .data(first20)
        .enter()
        .append("g")
        .attr("transform", (d) => {
            //console.log(d);
            return "translate(" + xScale(d.Youtuber) + ",0)";
        })
        .on("mousemove", function(event, d) {
            hover_label.attr("display", null);
            let mouseX = (event.layerX - (HORIZONTAL_MARGIN + 13));
            let mouseY = event.layerY - VERTICAL_MARGIN * 2;

            console.log(d);

            hover_label.selectAll("rect")
                .attr("x", mouseX + 10)
                .attr("y", mouseY + 35)
                //.attr("tranform", `translate(${mouseX}, ${mouseY})`)
                .attr("display", null);

            let subscribersDisplayData = d3.select(".subscribers-text")
            subscribersDisplayData
                .attr("transform", `translate(${mouseX}, ${mouseY})`)
                .text("Subscribers: " + d3.format(".3s")(d.subscribers))
                .attr("display", null);

            let channelNameDisplayData = d3.select(".channel-name-text");
            channelNameDisplayData
                .attr("transform", `translate(${mouseX}, ${mouseY})`)
                .text("Channel: " + d.Youtuber)
                .attr("display", null);

            
            let channelViewsDisplayData = d3.select(".channel-views-text");
            channelViewsDisplayData
                .attr("transform", `translate(${mouseX}, ${mouseY})`)
                .text("Views: " + d3.format(".3s")(d["video views"]).replace("G", "B"))
                .attr("display", null);

            let videoUploadsDisplayData = d3.select(".video-uploads-text");
                videoUploadsDisplayData
                    .attr("transform", `translate(${mouseX}, ${mouseY})`)
                    .text("Uploads: " + d3.format(".3s")(d.uploads))
                    .attr("display", null);

            

        })
        .on("mouseout", function() {
            hover_label.attr("display", "none");
            let subscribersDisplayData = d3.select(".subscribers-text");
            subscribersDisplayData.attr("display", "none");
        })
        .selectAll("chart_rectangle")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
        .classed("chart_rectangle", true)
        .attr("x", (d) => {
            return xSubGroup(d.key);
        })
        // This is where we scale the individual bars based on their name
        .attr("y", (d) => {
            console.log(d);
            if (d.key === "subscribers")
                return yScaleSubscribers(d.value);
            else if (d.key === "video views")
                return yScaleVideoViews(d.value);
            else if (d.key === "uploads")
                return yScaleUploads(d.value);
        })
        .attr("width", xSubGroup.bandwidth())
        .attr("height", function (d) {
            if (d.key === "subscribers") {
                return CHART_HEIGHT - yScaleSubscribers(d.value);
            }
            else if (d.key === "video views")
                return CHART_HEIGHT - yScaleVideoViews(d.value);
            else if (d.key === "uploads")
                return CHART_HEIGHT - yScaleUploads(d.value);
        })
        .attr("fill", function (d) { return color(d.key); })
        .on("click", function (event, d) {
            switchYAxis(d.key);

            d3.selectAll(".chart_rectangle")
                .transition().duration(ANIMATION_DURATION)    
                .attr("opacity", 1)
                .attr("stroke-width", 1)
                .attr("stroke", "rgb(0, 0, 0)");
            d3.selectAll(".chart_rectangle").filter(function (d) {
                return d.key !== yAxisToShow;
            })
              .transition().duration(ANIMATION_DURATION)
              .attr("opacity", 0.2)
              .attr("stroke-width", 0);
        })

        d3.selectAll(".chart_rectangle")
        .attr("opacity", 1)
        .attr("stroke-width", 1)
        .attr("stroke", "rgb(0, 0, 0)");
    d3.selectAll(".chart_rectangle").filter(function (d) {
        return d.key !== yAxisToShow;
    })
      .attr("opacity", 0.2)
      .attr("stroke-width", 0);

    // This must be after the rectangles in order to render
    // in the correct order.
    let hover_label = svg.append("g")
      .attr("id", "hover-label")
      .attr("display", "none");
  
    hover_label.append("rect")
        .attr("id", "tooltip-rectangle")
        .attr("x", 1)
        .attr("y", 10)
        .attr("width", 300)
        .attr("height", 70);

    hover_label.append("text")
        .attr("class", "subscribers-text")
        .attr("x", 15)
        .attr("y", 65);
    
    hover_label.append("text")
        .attr("class", "channel-name-text")
        .attr("x", 15)
        .attr("y", 50);

    hover_label.append("text")
        .attr("class", "channel-views-text")
        .attr("x", 15)
        .attr("y", 80);

    hover_label.append("text")
        .attr("class", "video-uploads-text")
        .attr("x", 15)
        .attr("y", 95);
}

function switchYAxis(newYAxisValue) {
    yAxisToShow = newYAxisValue;
    switch (newYAxisValue) {
        case 'subscribers':
            d3.select("#y-axis-subscribers").classed("hidden", false);
            d3.select("#y-axis-video-views").classed("hidden", true);
            d3.select("#y-axis-uploads").classed("hidden", true);
            d3.select(".left-text")
            .attr("opacity", 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .text("Subscribers")
            .attr("opacity", 1);
            break;
        case 'video views':
            d3.select("#y-axis-video-views").classed("hidden", false);
            d3.select("#y-axis-subscribers").classed("hidden", true);
            d3.select("#y-axis-uploads").classed("hidden", true);
            d3.select(".left-text")
            .attr("opacity", 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .text("Total Channel Views")
            .attr("opacity", 1);
            break;
        case 'uploads':
            d3.select("#y-axis-uploads").classed("hidden", false);
            d3.select("#y-axis-video-views").classed("hidden", true);
            d3.select("#y-axis-subscribers").classed("hidden", true);
            d3.select(".left-text")
            .attr("opacity", 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .text("Number of Video Uploads")
            .attr("opacity", 1);
            break;
        default:
            console.log("yAxis value not recognized");
            return;
    }
}


