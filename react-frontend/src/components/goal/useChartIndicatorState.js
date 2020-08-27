import React from "react";

export const getBivariateOptions = goal => goal.indicators.filter(d => !d.categorical);

const getDefaultIndicatorState = goal => {
    const chartOptions = getBivariateOptions(goal);

    return {
        chartOptions,
        // Question indicator is the X axis
        chart: chartOptions[0],
    };
};

export function useChartIndicatorState(goal, commonPillar) {
    const [currentIndicators, setCurrentIndicators] = React.useState(
        getDefaultIndicatorState(goal, commonPillar)
    );
    return [currentIndicators, setCurrentIndicators];
}
