import { flatten } from "lodash";
import React from "react";

const getDefaultIndicatorState = (pillar, goal) => {
    // TODO: module
    const bivariateYOptions = flatten(pillar.goals.map(d => d.indicators));

    const mapVisualisationOptions = goal.indicators.filter(d => d.isProgressIndicator);

    return {
        // Question indicator is the X axis
        bivariateX: goal.indicators[0],
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

    // TODO: remove most of this logic. goal and pillar won't change.

    React.useEffect(() => {
        if (!pillar) return;
        // Whenever active pillar changes, set the pillar indicator (Y) to the first avail.
        const bivariateYOptions = flatten(pillar.goals.map(d => d.indicators)).filter(
            d => !d.categorical
        );
        setCurrentIndicators(d => ({
            ...d,
            bivariateY: bivariateYOptions.length > 1 ? bivariateYOptions[1] : bivariateYOptions[0],
        }));
    }, [pillar]);

    React.useEffect(() => {
        if (!goal) return;
        if (goal.categorical) {
            setCurrentIndicators(d => ({
                ...d,
                bivariateX: goal.indicators.filter(d => !d.categorical)[0],
                bivariateXEnabled: false,
                bivariateYEnabled: false,
                mapVisualisationEnabled: true,
            }));
        } else {
            // Whenever active QUESTION changes, set the pillar indicator to the first for the question
            setCurrentIndicators(d => ({
                ...d,
                bivariateX: goal.indicators[0],
                bivariateXEnabled: true,
                bivariateYEnabled: false,
            }));
        }
    }, [goal]);
    return [currentIndicators, setCurrentIndicators];
}
