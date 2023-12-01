// Initial state 
export let state = {
    yAxisToShow: "subscribers",
    data: []
};

// Get the current state
export function getState() {
    return state;
}

// Update state
export function updateState(key, value) {
    if (state.hasOwnProperty(key)) {
        state[key] = value;

        // TODO: Rerender affected components
    }
}

// Set the data
export function setData(data) {
    state.data = data;
}

// Change y-axis
export function switchYAxis(newAxis) {
    updateState('yAxisToShow', newAxis);
    // TODO: Trigger animations
}
