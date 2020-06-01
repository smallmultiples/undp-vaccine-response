import React from "react";
import DeckGL, { GeoJsonLayer, WebMercatorViewport } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map-vis.module.scss";

const SHEET_ROW_ID = "Alpha-3 code";
const GEO_SHAPE_ID = "ISO3";

const useGeoData = () => {
    const [shapeData, setShapeData] = React.useState(null);

    React.useEffect(() => {
        // Only load shapes once.
        (async () => {
            const res = await axios(`${process.env.PUBLIC_URL}/data/world.topojson`);
            const fc = topojsonParse(res.data, "world");
            setShapeData(fc);
        })();
    }, []);

    const loading = React.useMemo(() => {
        return [shapeData].some(d => !d);
    }, [shapeData]);

    return {
        shapeData,
        loading,
    };
};

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

    return [mapContainerRef, viewport, handleViewStateChange];
};

const MapVis = props => {
    const { normalizedData, countryDataLoading, scales, currentIndicators } = props;
    const [mapContainerRef, viewport, handleViewStateChange] = useDeckViewport();
    const [tooltip, setTooltip] = React.useState(null);
    const { shapeData, loading: geoLoading } = useGeoData();

    const loading = [geoLoading, countryDataLoading].some(d => d);

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: shapeData,
            filled: true,
            getFillColor: shape => {
                const row = normalizedData && normalizedData[shape.properties[GEO_SHAPE_ID]];
                return scales.color(row);
            },
            stroked: true,
            getLineColor: shape => {
                const row = normalizedData && normalizedData[shape.properties[GEO_SHAPE_ID]];
                return scales.stroke(row);
            },
            lineWidthMinPixels: 0.5,
            pickable: true,
            onHover: info => (info.object ? setTooltip(info) : setTooltip(null)),
            updateTriggers: {
                getFillColor: [normalizedData, currentIndicators],
                getLineColor: [normalizedData, currentIndicators],
            },
        }),
    ];

    return (
        <div>
            <div className={styles.mapContainer} ref={mapContainerRef}>
                {viewport && (
                    <DeckGL
                        viewState={viewport}
                        controller
                        layers={layers}
                        onViewStateChange={handleViewStateChange}
                    />
                )}
                {viewport && !loading && (
                    <CircleVis
                        viewport={viewport}
                        scales={scales}
                        normalizedData={normalizedData}
                        currentIndicators={currentIndicators}
                    />
                )}
                <MapTooltip
                    tooltip={tooltip}
                    normalizedData={normalizedData}
                    currentIndicators={currentIndicators}
                />
                <div className={styles.loader} data-visible={loading}>
                    {/* todo: nicer loader. move up? */}
                    <h4>Loading...</h4>
                </div>
            </div>
        </div>
    );
};

// TODO: module these
const getFormattedTooltipValue = (row, indicator) => {
    const val = row[indicator.tooltipKey || indicator.dataKey];
    if (val === undefined || val === "") return null;
    return indicator.format(val);
};

const MapTooltip = props => {
    const { tooltip, normalizedData, currentIndicators } = props;

    const data = React.useMemo(() => {
        if (!tooltip) return null;
        return normalizedData[tooltip.object.properties[GEO_SHAPE_ID]];
    }, [tooltip, normalizedData]);

    if (!data) return null;

    return (
        <div
            className={styles.tooltip}
            style={{
                left: tooltip.x,
                top: tooltip.y,
            }}
        >
            <div className={styles.tooltipHeader}>
                <div className={styles.tooltipHeading}>{data["Country or Area"]}</div>
            </div>
            <div className={styles.tooltipBody}>
                {currentIndicators.radiusEnabled && (
                    <div className={styles.tooltipDatum}>
                        <div className={styles.tooltipDatumIcon} data-radius />
                        <div className={styles.tooltipDatumText}>
                            <div className={styles.tooltipDatumLabel}>
                                {currentIndicators.radius.label}
                            </div>
                            <div className={styles.tooltipDatumValue}>
                                {getFormattedTooltipValue(data, currentIndicators.radius)}
                            </div>
                        </div>
                    </div>
                )}
                {currentIndicators.bivariateXEnabled && (
                    <div className={styles.tooltipDatum}>
                        <div className={styles.tooltipDatumIcon} data-bivariate />
                        <div className={styles.tooltipDatumText}>
                            <div className={styles.tooltipDatumLabel}>
                                {currentIndicators.bivariateX.label}
                            </div>
                            <div className={styles.tooltipDatumValue}>
                                {getFormattedTooltipValue(data, currentIndicators.bivariateX)}
                            </div>
                        </div>
                    </div>
                )}
                {currentIndicators.bivariateYEnabled && (
                    <div className={styles.tooltipDatum}>
                        <div className={styles.tooltipDatumIcon} data-bivariate />
                        <div className={styles.tooltipDatumText}>
                            <div className={styles.tooltipDatumLabel}>
                                {currentIndicators.bivariateY.label}
                            </div>
                            <div className={styles.tooltipDatumValue}>
                                {getFormattedTooltipValue(data, currentIndicators.bivariateY)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const CircleVis = props => {
    const { viewport, scales, normalizedData, currentIndicators } = props;

    if (!currentIndicators.radiusEnabled) return null;

    const circles = Object.values(normalizedData).map(row => {
        if ([row["Longitude (average)"], row["Latitude (average)"]].some(d => !d)) return null;
        const [x, y] = viewport.project([row["Longitude (average)"], row["Latitude (average)"]]);
        const r = scales.radius(row);
        if (isNaN(r)) return null;
        return <circle key={row[SHEET_ROW_ID]} className={styles.visCircle} cx={x} cy={y} r={r} />;
    });

    return (
        <svg className={styles.circleVis}>
            <g>{circles}</g>
        </svg>
    );
};

export default MapVis;
