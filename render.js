import { getState, state } from './stateManager.js';
import { drawBarChart } from './barchart.js';

export function initRender(svg, data) {
    drawBarChart(state.data);
}

export function render() {
    const state = getState();
    drawBarChart(state.data)
}
