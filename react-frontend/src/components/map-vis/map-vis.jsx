import axios from "axios";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import { flatten, isNil, uniq } from "lodash";
import React from "react";
import { feature as topojsonParse } from "topojson-client";
import useDeckViewport from "../../hooks/use-deck-viewport";
import isMapOnly from "../../modules/is-map-only";
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

const MapVis = props => {
    const { normalizedData, countryDataLoading, scales, currentIndicators, goal } = props;
    const [
        mapContainerRef,
        viewport,
        handleViewStateChange,
        mapContainerDimensions,
    ] = useDeckViewport();
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
            onClick: info => {
                if (info.object.properties.ISO3 === "NPL") {
                    window.location = "./html2/nepal.html";
                }
            },
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
                        goal={goal}
                    />
                )}
                <MapTooltip
                    tooltip={tooltip}
                    normalizedData={normalizedData}
                    currentIndicators={currentIndicators}
                    goal={goal}
                    scales={scales}
                    mapContainerDimensions={mapContainerDimensions}
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
const getFormattedMapValue = (row, indicator) => {
    const val = row[indicator.dataKey];
    if (isNil(val) || val === "") return "-";
    return indicator.format(val);
};
const getFormattedTooltipValue = (row, indicator) => {
    const val = row[indicator.tooltipExtra.key];
    return indicator.tooltipExtra.format(val);
};

const MapTooltip = props => {
    const {
        tooltip,
        normalizedData,
        currentIndicators,
        goal,
        scales,
        mapContainerDimensions,
    } = props;

    const data = React.useMemo(() => {
        if (!tooltip) return null;
        return normalizedData[tooltip.object.properties[GEO_SHAPE_ID]];
    }, [tooltip, normalizedData]);

    if (!data) return null;

    let category = null;
    const categoricalIndicator = isMapOnly
        ? Object.values(currentIndicators).find(d => d.categorical)
        : goal.indicators.find(d => d.categorical);

    if (categoricalIndicator) {
        category = (
            <div className={styles.tooltipDatum}>
                <div className={styles.tooltipDatumIcon} data-category />
                <div className={styles.tooltipDatumText}>
                    <div className={styles.tooltipDatumLabel}>{categoricalIndicator.label}</div>
                    <div className={styles.tooltipDatumValue}>
                        {getFormattedMapValue(data, categoricalIndicator)}
                    </div>
                </div>
            </div>
        );
    }

    const clampedLeft = `min(${tooltip.x}px, calc(${mapContainerDimensions.width}px - 100%))`;
    const clampedY = `min(${tooltip.y}px, calc(${mapContainerDimensions.height}px - 100%))`;

    const transform = `translate(${clampedLeft}, ${clampedY})`;

    return (
        <div
            className={styles.tooltip}
            style={{
                transform,
            }}
        >
            <div className={styles.tooltipHeader}>
                <div className={styles.tooltipHeading}>{data["Country or Area"]}</div>
            </div>
            <div className={styles.tooltipBody}>
                {!categoricalIndicator && currentIndicators.radiusEnabled && (
                    <div className={styles.tooltipDatum}>
                        <div className={styles.tooltipDatumIcon} data-radius />
                        <div className={styles.tooltipDatumText}>
                            <div className={styles.tooltipDatumLabel}>
                                {currentIndicators.radius.label}
                            </div>
                            <div className={styles.tooltipDatumValue}>
                                {getFormattedMapValue(data, currentIndicators.radius)}
                            </div>
                        </div>
                    </div>
                )}
                {!categoricalIndicator &&
                    currentIndicators.radiusEnabled &&
                    currentIndicators.radius.tooltipExtra && (
                        <div className={styles.tooltipDatum}>
                            <div className={styles.tooltipDatumIcon} data-radius />
                            <div className={styles.tooltipDatumText}>
                                <div className={styles.tooltipDatumLabel}>
                                    {currentIndicators.radius.tooltipExtra.label}
                                </div>
                                <div className={styles.tooltipDatumValue}>
                                    {getFormattedTooltipValue(data, currentIndicators.radius)}
                                </div>
                            </div>
                        </div>
                    )}
                {category}
                {currentIndicators.bivariateXEnabled && !currentIndicators.bivariateX.categorical && (
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
                                {getFormattedMapValue(data, currentIndicators.bivariateX)}
                            </div>
                        </div>
                    </div>
                )}
                {currentIndicators.bivariateXEnabled &&
                    currentIndicators.bivariateX.tooltipExtra &&
                    !currentIndicators.bivariateX.categorical && (
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
                                    {currentIndicators.bivariateX.tooltipExtra.label}
                                </div>
                                <div className={styles.tooltipDatumValue}>
                                    {getFormattedTooltipValue(data, currentIndicators.bivariateX)}
                                </div>
                            </div>
                        </div>
                    )}
                {currentIndicators.bivariateYEnabled && !currentIndicators.bivariateY.categorical && (
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
                                {getFormattedMapValue(data, currentIndicators.bivariateY)}
                            </div>
                        </div>
                    </div>
                )}
                {currentIndicators.bivariateYEnabled &&
                    currentIndicators.bivariateY.tooltipExtra &&
                    !currentIndicators.bivariateY.categorical && (
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
                                    {currentIndicators.bivariateY.tooltipExtralabel}
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
    const { viewport, scales, normalizedData, currentIndicators, goal } = props;

    const categoryIndicator = React.useMemo(() => {
        if (isMapOnly) {
            return Object.values(currentIndicators).find(d => d.categorical);
        } else {
            return goal.indicators.find(d => d.categorical);
        }
    }, [goal, currentIndicators]);

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

    if (!currentIndicators.radiusEnabled) return null;

    let content = null;

    if (categoryIndicator) {
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
                    key={row[SHEET_ROW_ID]}
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
