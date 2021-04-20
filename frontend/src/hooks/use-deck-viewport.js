import { WebMercatorViewport } from "deck.gl";
import React from "react";
import useDimensions from "./use-dimensions";
import turfBbox from "@turf/bbox";

const getInitialBounds = initialBoundsOrFeature => {
    if (Array.isArray(initialBoundsOrFeature)) {
        return initialBoundsOrFeature;
    } else if (initialBoundsOrFeature.type === "Feature") {
        const bbox = turfBbox(initialBoundsOrFeature);

        const [minX, minY, maxX, maxY] = bbox;

        return [
            [minX, minY],
            [maxX, maxY],
        ];
    }
};

const useDeckViewport = (initialBoundsOrFeature, padding = 8) => {
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewport, setViewport] = React.useState(null);

    const initialBounds = React.useMemo(() => {
        if (!initialBoundsOrFeature) return null;
        return getInitialBounds(initialBoundsOrFeature);
    }, [initialBoundsOrFeature]);

    // Initial ONLY
    React.useEffect(() => {
        if (viewport) return;
        if (!mapContainerDimensions) return;
        if (!initialBounds) return;

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
    }, [mapContainerDimensions, initialBounds, padding, viewport]);

    // If bounds change.
    React.useEffect(() => {
        setViewport(v =>
            v
                ? new WebMercatorViewport({
                      ...v,
                  }).fitBounds(initialBounds, {
                      padding,
                  })
                : null
        );
    }, [initialBounds, padding]);

    const handleViewStateChange = React.useCallback(newState => {
        setViewport(v =>
            v
                ? new WebMercatorViewport({
                      ...v,
                      ...newState.viewState,
                  })
                : null
        );
    }, []);

    return [mapContainerRef, viewport, handleViewStateChange, mapContainerDimensions];
};

export default useDeckViewport;
