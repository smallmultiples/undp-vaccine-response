import { flatten } from "lodash";
import React from "react";

const getDefaultIndicatorState = (pillar, goal) => {
    // TODO: module? expose possible options in context?
    const bivariateYOptions = flatten(pillar.goals.map(d => d.indicators)).filter(
        d => !d.categorical
    );

    const mapVisualisationOptions = goal.indicators.filter(d => d.isProgressIndicator);

    return {
        // Question indicator is the X axis
        bivariateX: goal.indicators.filter(d => !d.categorical)[0],
        bivariateXEnabled: true,
        // Any indicator for the pillar on the Y axis
        bivariateY: bivariateYOptions.length > 1 ? bivariateYOptions[1] : bivariateYOptions[0],
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
