import React from "react";
import DeckGL, { GeoJsonLayer, WebMercatorViewport } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { isNil, flatten, uniq } from "lodash";
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
    const { normalizedData, countryDataLoading, scales, currentIndicators, activeQuestion } = props;
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
                        activeQuestion={activeQuestion}
                    />
                )}
                <MapTooltip
                    tooltip={tooltip}
                    normalizedData={normalizedData}
                    currentIndicators={currentIndicators}
                    activeQuestion={activeQuestion}
                    scales={scales}
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
    if (isNil(val) || val === "") return "-";
    return indicator.format(val);
};

const MapTooltip = props => {
    const { tooltip, normalizedData, currentIndicators, activeQuestion, scales } = props;

    const data = React.useMemo(() => {
        if (!tooltip) return null;
        return normalizedData[tooltip.object.properties[GEO_SHAPE_ID]];
    }, [tooltip, normalizedData]);

    if (!data) return null;

    let category = null;
    if (activeQuestion.categorical) {
        const categoricalIndicator = activeQuestion.indicators.find(d => d.categorical);
        category = (
            <div className={styles.tooltipDatum}>
                <div className={styles.tooltipDatumIcon} data-category />
                <div className={styles.tooltipDatumText}>
                    <div className={styles.tooltipDatumLabel}>{categoricalIndicator.label}</div>
                    <div className={styles.tooltipDatumValue}>
                        {getFormattedTooltipValue(data, categoricalIndicator)}
                    </div>
                </div>
            </div>
        );
    }

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
                {!activeQuestion.categorical && currentIndicators.radiusEnabled && (
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
                {category}
                {currentIndicators.bivariateXEnabled && (
                    <div className={styles.tooltipDatum}>
                        <div
                            className={styles.tooltipDatumIcon}
                            data-bivariate
                            style={{
                                background: scales.colorX(data),
                            }}
                        />
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
                        <div
                            className={styles.tooltipDatumIcon}
                            data-bivariate
                            style={{
                                background: scales.colorY(data),
                            }}
                        />
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

const categorySplit = val => val.split(";").map(d => d.trim());

const groupRadius = 7;

const CircleVis = props => {
    const { viewport, scales, normalizedData, currentIndicators, activeQuestion } = props;

    const categoryIndicator = React.useMemo(
        () => activeQuestion.indicators.find(d => d.categorical),
        [activeQuestion]
    );

    const uniqueVals = React.useMemo(() => {
        if (!categoryIndicator) return null;
        return uniq(
            flatten(
                Object.values(normalizedData).map(d => {
                    const val = d[categoryIndicator.dataKey];
                    if (isNil(val)) return null;
                    return categorySplit(val);
                })
            ).filter(d => d && d.length)
        );
    }, [normalizedData, categoryIndicator]);

    const rowXY = row => {
        const [lng, lat] = [row["Longitude (average)"], row["Latitude (average)"]];
        if ([lng, lat].some(d => !d)) return null;
        return viewport.project([lng, lat]);
    };

    let content = null;

    if (activeQuestion.categorical) {
        // TODO: this is assuming one categorical per question. will need code later.
        const angleEach = 360 / uniqueVals.length;

        const groups = Object.values(normalizedData).map(row => {
            const val = row[categoryIndicator.dataKey];
            if (isNil(val)) return null;
            const cats = categorySplit(val);
            const xy = rowXY(row);
            if (!xy) return null;
            const r = 4;

            const groupCircles = uniqueVals.map((cat, i) => {
                const a = i * angleEach - 90;
                const active = cats.includes(cat);
                return (
                    <circle
                        key={row[SHEET_ROW_ID] + cat}
                        className={styles.visCategoryCircle}
                        data-i={i}
                        data-active={active}
                        r={r}
                        style={{
                            transform: `rotate(${a}deg) translateX(${groupRadius}px)`,
                        }}
                    />
                );
            });

            return (
                <g
                    style={{
                        transform: `translate(${xy[0]}px, ${xy[1]}px)`,
                    }}
                >
                    {groupCircles}
                </g>
            );
        });
        content = <g>{groups}</g>;
    } else if (currentIndicators.radiusEnabled) {
        const circles = Object.values(normalizedData).map(row => {
            const xy = rowXY(row);
            if (!xy) return null;
            const [x, y] = xy;
            const r = scales.radius(row);
            if (isNaN(r)) return null;
            return (
                <circle key={row[SHEET_ROW_ID]} className={styles.visCircle} cx={x} cy={y} r={r} />
            );
        });
        content = <g>{circles}</g>;
    }

    return <svg className={styles.circleVis}>{content}</svg>;
};

export default MapVis;
