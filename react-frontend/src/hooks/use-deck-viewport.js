import { WebMercatorViewport } from "deck.gl";
import React from "react";
import useDimensions from "./use-dimensions";

// Bounds we zoom to on load.
// North west lng lat
// South east lng lat
const INITIAL_BOUNDS = [
    [-180, 76],
    [180, -60],
];
const useDeckViewport = (initialBounds = INITIAL_BOUNDS, padding = 8) => {
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewport, setViewport] = React.useState(null);

    React.useEffect(() => {
        if (viewport) return;
        if (!mapContainerDimensions) return;
        setViewport(
            new WebMercatorViewport({
                longitude: 0,
                latitude: 0,
                zoom: 1,
                pitch: 0,
                bearing: 0,
                width: mapContainerDimensions.width,
                height: mapContainerDimensions.height,
            }).fitBounds(initialBounds, {
                padding,
            })
        );
    }, [mapContainerDimensions, viewport, initialBounds, padding]);

    const handleViewStateChange = React.useCallback(newState => {
        setViewport(
            v =>
                new WebMercatorViewport({
                    ...v,
                    ...newState.viewState,
                })
        );
    }, []);

    return [mapContainerRef, viewport, handleViewStateChange, mapContainerDimensions];
};

export default useDeckViewport;
