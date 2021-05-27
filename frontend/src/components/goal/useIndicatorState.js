import React from "react";
import { flatten, uniqBy } from "lodash";

export const getBivariateOptions = (goal, commonPillar) => {
    const goalOpts = goal.indicators.filter(d => !(d.categorical || d.binary || d.isDate));
    const commonOpts = flatten(
        commonPillar.goals.map(goal =>
            goal.indicators.filter(d => !(d.categorical || d.binary || d.isDate))
        )
    );

    return [...goalOpts, ...commonOpts];
};
export const getMapVisualisationOptions = (goal, commonPillar) => {
    const goalOpts = goal.indicators.filter(d => d.isProgressIndicator);
    const commonOpts = flatten(commonPillar.goals.map(goal => goal.indicators));

    if (goal.prioritizeCommonTrackingIndicators) {
        return [...commonOpts, ...goalOpts];
    }

    return [...goalOpts, ...commonOpts];
};

const getDefaultIndicatorState = (goal, commonPillar) => {
    const mapVisualisationOptions = uniqBy(
        getMapVisualisationOptions(goal, commonPillar),
        d => d.label
    );
    const bivariateOptions = getBivariateOptions(goal, commonPillar);
    const chartOptions = getBivariateOptions(goal, commonPillar);

    return {
        // Remove duplicates in tracking indicator drop-down
        mapVisualisationOptions,
        bivariateOptions,
        chartOptions,
        // Question indicator is the X axis
        bivariateX: bivariateOptions[0],
        bivariateXEnabled: true,
        // Any indicator for the pillar on the Y axis
        bivariateY: bivariateOptions.length > 1 ? bivariateOptions[1] : bivariateOptions[0],
        bivariateYEnabled: false,
        // "above-map" layer, be it simple circles or whatever. Is a "progress indicator".
        mapVisualisation:
            mapVisualisationOptions.find(x => x.dataKey === goal.defaultBaseIndicator) ||
            mapVisualisationOptions[0],
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
