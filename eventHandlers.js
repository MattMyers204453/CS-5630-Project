import { switchYAxis } from './stateManager.js';
import { updateVisualization } from './render.js';

export function setupEventListeners() {
    d3.selectAll("rect").on("click", function(event, d) {
        switchYAxis(d.key);
        updateVisualization();
    });
}
