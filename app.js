import { getData } from './data.js';
import { initRender, render } from './render.js';
import { setupEventListeners } from './eventHandlers.js';
import { setData } from './stateManager.js';

async function init() {
    let data = await getData();
    // Only use first 20 rows
    let first20 = data.filter((row) => {
        return row.rank < 21;
    });
    // const svgContainer = d3.select("#visualization-one")
    //     .append("svg");

    // Save the data to be accessed globablly
    setData(first20);

    // Draw visualization
    initRender(first20);

    // Set up event listeners
    setupEventListeners();
}

init();
