import { getState, state } from './stateManager.js';
import { createBarChart } from './barchart.js';

export function initVis(svg, data) {
    createBarChart(state.data);
}

export function updateVisualization() {
    const state = getState();
    createBarChart(state.data)
    // Logic to update the visualization based on the new state
    // For instance, adjusting the y-axis or updating bar colors
}
