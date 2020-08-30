import React from "react";
import { flatten } from "lodash";

export const getBivariateOptions = goal => goal.indicators.filter(d => !d.categorical);
export const getMapVisualisationOptions = (goal, commonPillar) => {
    const goalOpts = goal.indicators.filter(d => d.isProgressIndicator);
    const commonOpts = flatten(commonPillar.goals.map(goal => goal.indicators));

    if (goal.prioritizeCommonTrackingIndicators) {
        return [...commonOpts, ...goalOpts];
    }

    return [...goalOpts, ...commonOpts];
};

const getDefaultIndicatorState = (goal, commonPillar) => {
    const mapVisualisationOptions = getMapVisualisationOptions(goal, commonPillar);
    const bivariateOptions = getBivariateOptions(goal);
    const chartOptions = getBivariateOptions(goal);

    return {
        // Remove duplicates in tracking indicator drop-down
        mapVisualisationOptions: [...new Map(mapVisualisationOptions.map(item => [item.dataKey, item])).values()],
        bivariateOptions,
        chartOptions,
        // Question indicator is the X axis
        bivariateX: bivariateOptions[0],
        bivariateXEnabled: true,
        // Any indicator for the pillar on the Y axis
        bivariateY: bivariateOptions.length > 1 ? bivariateOptions[1] : bivariateOptions[0],
        bivariateYEnabled: false,
        // "above-map" layer, be it simple circles or whatever. Is a "progress indicator".
        mapVisualisation: mapVisualisationOptions[0],
        mapVisualisationEnabled: mapVisualisationOptions.length > 0,
        chart: chartOptions[0],
    };
};

export function useIndicatorState(goal, commonPillar) {
    const [currentIndicators, setCurrentIndicators] = React.useState(
        getDefaultIndicatorState(goal, commonPillar)
    );
    return [currentIndicators, setCurrentIndicators];
}
