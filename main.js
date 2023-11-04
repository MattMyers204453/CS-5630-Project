import { getData } from './data.js';

let data = [];
let first20 = [];
let yAxisToShow = "subscribers";
const HORIZONTAL_MARGIN = 100;
const VERTICAL_MARGIN = 200;
const CHART_WIDTH = 1200;
const CHART_HEIGHT = 600;

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
        .attr("transform", "translate(" + HORIZONTAL_MARGIN + "," + VERTICAL_MARGIN + ")");

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
        .range(['#e41a1c', '#377eb8', "#FFFF00"])

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
        .attr("id", "y-axis-views")
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
        .selectAll("rect")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter().append("rect")
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
            console.log("Clicked bar data:", d);
            let newYAxisValue = (d.key === 'video views') ? 'views' : d.key;
            console.log(newYAxisValue);
            switchYAxis(newYAxisValue);
        });
}

function switchYAxis(newYAxisValue) {
    switch (newYAxisValue) {
        case 'subscribers':
            d3.select("#y-axis-subscribers").classed("hidden", false);
            d3.select("#y-axis-views").classed("hidden", true);
            d3.select("#y-axis-uploads").classed("hidden", true);
            break;
        case 'views':
            d3.select("#y-axis-views").classed("hidden", false);
            d3.select("#y-axis-subscribers").classed("hidden", true);
            d3.select("#y-axis-uploads").classed("hidden", true);
            break;
        case 'uploads':
            d3.select("#y-axis-uploads").classed("hidden", false);
            d3.select("#y-axis-views").classed("hidden", true);
            d3.select("#y-axis-subscribers").classed("hidden", true);
            break;
        default:
            console.log("yAxis value not recognized");
            return;
    }
}


