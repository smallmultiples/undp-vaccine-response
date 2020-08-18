import React from "react";

export const getBivariateOptions = goal => goal.indicators.filter(d => !d.categorical);
export const getMapVisualisationOptions = goal =>
    goal.indicators.filter(d => d.isProgressIndicator);

const getDefaultIndicatorState = (pillar, goal) => {
    const mapVisualisationOptions = getMapVisualisationOptions(goal);
    const bivariateOptions = getBivariateOptions(goal);

    return {
        // Question indicator is the X axis
        bivariateX: bivariateOptions[0],
        bivariateXEnabled: true,
        // Any indicator for the pillar on the Y axis
        bivariateY: bivariateOptions.length > 1 ? bivariateOptions[1] : bivariateOptions[0],
        bivariateYEnabled: false,
        // "above-map" layer, be it simple circles or whatever. Is a "progress indicator".
        mapVisualisation: mapVisualisationOptions[0],
        mapVisualisationEnabled: mapVisualisationOptions.length > 0,
    };
};

export function useIndicatorState(pillar, goal) {
    const [currentIndicators, setCurrentIndicators] = React.useState(
        getDefaultIndicatorState(pillar, goal)
    );
    return [currentIndicators, setCurrentIndicators];
}
