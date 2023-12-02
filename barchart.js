import { state } from './stateManager.js';
import { switchYAxis } from './stateManager.js';
import { render } from './render.js';
import { capitalize } from './utils.js';

export function drawBarChart(data) {

    clearBarChart();

    const HORIZONTAL_MARGIN = 150;
    const VERTICAL_MARGIN = 200;
    const CHART_WIDTH = 1200;
    const CHART_HEIGHT = 600;
    const ANIMATION_DURATION = 500;

    // Get YouTuber names for x-axis
    let YouTubers = d3.map(data, (row) => {
        return row.Youtuber;
    });

    // Define 3 metrics (3 different bars)
    let subgroups = ["subscribers", "video views", "uploads"];


    const svgContainer = d3.select("#visualization-one")
        .append("svg")
        .attr("width", CHART_WIDTH + HORIZONTAL_MARGIN * 2)
        .attr("height", CHART_HEIGHT + VERTICAL_MARGIN * 2);

    // Create backdrop with margins
    const svg = svgContainer.append("g")
        .attr("transform", `translate(${HORIZONTAL_MARGIN},${VERTICAL_MARGIN})`);

    // Y-axis label
    svg.append("text")
        .classed("left-text", true)
        .attr("x", "0")
        .attr("y", "250")
        .text(capitalize(state.yAxisToShow))
        .attr("transform", "translate(-365, 350)rotate(270)");

    // X-axis label
    svg.append("text")
        .classed("bottom-text", true)
        .attr("x", CHART_WIDTH / 2 - 50)
        .attr("y", CHART_HEIGHT + VERTICAL_MARGIN - 50)
        .text("Channel Name");

    // Define XScale
    let xScale = d3.scaleBand()
        .domain(YouTubers)
        .range([0, CHART_WIDTH])
        .padding([0.2]);

    // Pick color of each metric
    let color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#377eb8", '#e41a1c', "#FFFF00"]);

    let xSubGroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, xScale.bandwidth()])
        .padding([0.05]);

    // Y-Axis maximum values
    let maxYValues = {
        'subscribers': d3.max(data, d => +d.subscribers),
        'video views': d3.max(data, d => +d["video views"]),
        'uploads': d3.max(data, d => +d["uploads"])
    };

    // Y-Axis scales
    let yScales = {
        'subscribers': d3.scaleLinear().domain([0, maxYValues['subscribers']]).range([CHART_HEIGHT, 0]),
        'video views': d3.scaleLinear().domain([0, maxYValues['video views']]).range([CHART_HEIGHT, 0]),
        'uploads': d3.scaleLinear().domain([0, maxYValues['uploads']]).range([CHART_HEIGHT, 0])
    };

    // Draw X-Axis
    svg.append("g")
        .classed("x-scale", true)
        .attr("transform", `translate(0,${CHART_HEIGHT})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-70)");

    // Draw Y-Axis for each metric
    Object.keys(yScales).forEach((key) => {
        let yAxisId = '';
        if (key === 'subscribers') {
            yAxisId = 'y-axis-subscribers';
        }
        else if (key === 'video views') {
            yAxisId = 'y-axis-video-views';
        }
        else if (key === 'uploads') {
            yAxisId = 'y-axis-uploads';
        }
        svg.append("g")
            .classed("y-axis", true)
            .classed("hidden", key !== state.yAxisToShow)
            .attr("id", yAxisId)
            .call(d3.axisLeft(yScales[key]));
    });

    // Draw Bars
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xScale(d.Youtuber)},0)`)
        .on("mousemove", function (event, d) {
            hover_label.attr("display", null);
            let mouseX = (event.layerX - (HORIZONTAL_MARGIN + 13));
            let mouseY = event.layerY - VERTICAL_MARGIN * 2;

            console.log(d);

            hover_label.selectAll("rect")
                .attr("x", mouseX + 10)
                .attr("y", mouseY - 65)
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
        .on("mouseout", function () {
            hover_label.attr("display", "none");
            let subscribersDisplayData = d3.select(".subscribers-text");
            subscribersDisplayData.attr("display", "none");
        })
        .selectAll("chart_rectangle")
        .data(function (d) { return subgroups.map(function (key) { return { key: key, value: d[key] }; }); })
        .enter()
        .append("rect")
        .classed("chart_rectangle", true)
        .attr("x", d => xSubGroup(d.key))
        .attr("y", d => yScales[d.key](d.value))
        .attr("width", xSubGroup.bandwidth())
        .attr("height", d => CHART_HEIGHT - yScales[d.key](d.value))
        .attr("fill", d => color(d.key))
        .attr("opacity", d => d.key === state.yAxisToShow ? 1 : 0.2)
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
            render();
        });

    // This must be after the rectangles in order to render
    // in the correct order.
    let hover_label = svg.append("g")
        .attr("id", "hover-label")
        .attr("display", "none");

    hover_label.append("rect")
        .attr("id", "tooltip-rectangle")
        .attr("x", 1)
        .attr("y", -60)
        .attr("width", 300)
        .attr("height", 70);

    hover_label.append("text")
        .attr("class", "subscribers-text")
        .attr("x", 15)
        .attr("y", -35);

    hover_label.append("text")
        .attr("class", "channel-name-text")
        .attr("x", 15)
        .attr("y", -50);

    hover_label.append("text")
        .attr("class", "channel-views-text")
        .attr("x", 15)
        .attr("y", -20);

    hover_label.append("text")
        .attr("class", "video-uploads-text")
        .attr("x", 15)
        .attr("y", -5);
}

function clearBarChart() {
    d3.select("#visualization-one").selectAll("*").remove();
}
