import React from "react";
import DeckGL, { GeoJsonLayer, Viewport, WebMercatorViewport } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map-vis.module.scss";
import { extent } from "d3-array";
import { scaleLinear, scaleLog } from "d3-scale";
import Geostats from "geostats";
import { IconArrowLeft, IconArrowRight } from "../icons/icons";

const GOOD_SHAPE_STROKE = [255, 255, 255];
const NULL_SHAPE_FILL = [255, 255, 255]; // #FFFFFF
const NULL_SHAPE_STROKE = [233, 236, 246]; // #E9ECF6
const SHEET_ROW_ID = "Alpha-3 code";
const GEO_SHAPE_ID = "ISO3";
// If true, pink is left, if false pink is right
const FLIP_COLOURS_HORIZONTALLY = true;
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

const MapVis = props => {
    const { normalizedData, countryDataLoading, scales, displaySettings } = props;
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewport, setViewport] = React.useState(null);
    const [tooltip, setTooltip] = React.useState(null);

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
            }).fitBounds(
                // Bounds we zoom to on load.
                // North west lng lat
                // South east lng lat
                [
                    [-180, 76],
                    [180, -60],
                ],
                {
                    // Pixel padding around the bounds
                    padding: 8,
                }
            )
        );
    }, [mapContainerDimensions, viewport]);

    const handleViewStateChange = React.useCallback(newState => {
        setViewport(
            v =>
                new WebMercatorViewport({
                    ...v,
                    ...newState.viewState,
                })
        );
    }, []);

    const { shapeData, loading: geoLoading } = useGeoData();

    const loading = [geoLoading, countryDataLoading].some(d => d);

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: shapeData,
            filled: true,
            getFillColor: shape => {
                const row = normalizedData[shape.properties[GEO_SHAPE_ID]];
                if (!row) {
                    return NULL_SHAPE_FILL;
                }
                return scales.color(row);
            },
            stroked: true,
            getLineColor: shape => {
                const row = normalizedData[shape.properties[GEO_SHAPE_ID]];
                if (!row) {
                    return NULL_SHAPE_STROKE;
                }
                return scales.stroke(row);
            },
            lineWidthMinPixels: 0.5,
            pickable: true,
            onHover: info => (info.object ? setTooltip(info) : setTooltip(null)),
            updateTriggers: {
                getFillColor: [
                    normalizedData,
                    displaySettings.bivariateEnableX,
                    displaySettings.bivariateEnableY,
                ],
                getLineColor: [
                    normalizedData,
                    displaySettings.bivariateEnableX,
                    displaySettings.bivariateEnableY,
                ],
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
                        displaySettings={displaySettings}
                    />
                )}
                <MapTooltip
                    tooltip={tooltip}
                    normalizedData={normalizedData}
                    displaySettings={displaySettings}
                />
                <div className={styles.loader} data-visible={loading}>
                    {/* todo: nicer loader. move up? */}
                    <h4>Loading...</h4>
                </div>
            </div>
        </div>
    );
};

const formatNumTemp = number => (number === undefined ? "" : number.toFixed(1));

const MapTooltip = props => {
    const { tooltip, normalizedData, displaySettings } = props;

    const data = React.useMemo(() => {
        if (!tooltip) return null;
        return normalizedData[tooltip.object.properties[GEO_SHAPE_ID]];
    }, [tooltip]);

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
                <div className={styles.tooltipHeading}>{data.Country}</div>
            </div>
            <div className={styles.tooltipBody}>
                <div className={styles.tooltipDatum}>
                    <div className={styles.tooltipDatumValue}>
                        {formatNumTemp(data[displaySettings.variateXColumn])}
                    </div>
                    <div className={styles.tooltipDatumLabel}>{displaySettings.variateXColumn}</div>
                </div>
                <div className={styles.tooltipDatum}>
                    <div className={styles.tooltipDatumValue}>
                        {formatNumTemp(data[displaySettings.variateYColumn])}
                    </div>
                    <div className={styles.tooltipDatumLabel}>{displaySettings.variateYColumn}</div>
                </div>
            </div>
        </div>
    );
};

const CircleVis = props => {
    const { viewport, scales, normalizedData, displaySettings } = props;

    if (!displaySettings.circleRadiusColumn) return null;

    const circles = Object.values(normalizedData).map(row => {
        if (row.circleValue === null || row.circleValue === undefined) return null;
        if ([row["Longitude (average)"], row["Latitude (average)"]].some(d => !d)) return null;
        const [x, y] = viewport.project([row["Longitude (average)"], row["Latitude (average)"]]);
        const r = scales.radius(row.circleValue);
        return <circle key={row[SHEET_ROW_ID]} className={styles.visCircle} cx={x} cy={y} r={r} />;
    });

    return (
        <svg className={styles.circleVis}>
            <g>{circles}</g>
        </svg>
    );
};

export default MapVis;
