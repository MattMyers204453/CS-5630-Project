import { state } from './stateManager.js';

export function createBarChart(data) {
    
    const HORIZONTAL_MARGIN = 150;
    const VERTICAL_MARGIN = 200;
    const CHART_WIDTH = 1200;
    const CHART_HEIGHT = 600;

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
        .text("Subscribers")
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
        .selectAll("rect")
        .data(d => subgroups.map(key => ({ key: key, value: d[key] })))
        .enter().append("rect")
        .attr("x", d => xSubGroup(d.key))
        .attr("y", d => yScales[d.key](d.value))
        .attr("width", xSubGroup.bandwidth())
        .attr("height", d => CHART_HEIGHT - yScales[d.key](d.value))
        .attr("fill", d => color(d.key))
        .attr("opacity", d => d.key === state.yAxisToShow ? 1 : 0.2)
        .on("click", function (event, d) {
            // TODO: Change y-axis and highlighted bars 
        });
}
