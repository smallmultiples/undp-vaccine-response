import DeckGL, { GeoJsonLayer, MapController } from "deck.gl";
import { flatten, isNil, uniq } from "lodash";
import React from "react";
import { feature as topojsonParse } from "topojson-client";
import useDeckViewport from "../../hooks/use-deck-viewport";
import { categorySplit, getRowIndicatorValue } from "../../modules/utils";
import styles from "./map-vis.module.scss";
import useMediaQuery from "../../hooks/use-media-query";
import { Chevron, Plus } from "../icons/icons";
import { format, subDays } from "date-fns";
import worldMap from './worldMap.json';

const SHEET_ROW_ID = "iso3";
const GEO_SHAPE_ID = "ISO3";

// Bounds we zoom to on load.
// North west lng lat
// South east lng lat
const INITIAL_BOUNDS = [
    [-180, 76],
    [180, -60],
];

const useGeoData = () => {
    const [shapeData, setShapeData] = React.useState(null);

    React.useEffect(() => {
        // Only load shapes once.
        (async () => {
            const fc = topojsonParse(worldMap, "world");
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
    const {
        normalizedData,
        selectedCountryCode,
        countryDataLoading,
        scales,
        currentIndicators,
        goal,
        countryCode,
        sourcesData,
    } = props;
    const [tooltip, setTooltip] = React.useState(null);
    const [clickTooltip, setClickTooltip] = React.useState(null);
    const { shapeData, loading: geoLoading } = useGeoData();
    const { isMobile } = useMediaQuery();
    const initialBoundsOrFeature = React.useMemo(() => {
        if (countryCode) {
            if (!shapeData) return undefined;
            return shapeData.features.find(f => f.properties[GEO_SHAPE_ID] === countryCode);
        } else {
            return INITIAL_BOUNDS;
        }
    }, [countryCode, shapeData]);

    const [
        mapContainerRef,
        viewport,
        handleViewStateChange,
        mapContainerDimensions,
    ] = useDeckViewport(initialBoundsOrFeature);

    const zoomIncrement = React.useCallback(
        amt => {
            const newZoom = Math.min(Math.max(viewport.zoom + amt, 0.001), 10);
            handleViewStateChange({
                viewState: {
                    zoom: newZoom,
                    transitionDuration: 5000,
                },
            });
        },
        [viewport, handleViewStateChange]
    );

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
            getLineWidth: shape => {
                if (selectedCountryCode && selectedCountryCode === shape.properties[GEO_SHAPE_ID]) {
                    return 1.5;
                }
                return 0.5;
            },
            lineWidthUnits: "pixels",
            pickable: true,
            onHover: info => (info.object ? setTooltip(info) : setTooltip(null)),
            onClick: info => {
                if (info.object) {
                    props.onCountryClicked(info.object.properties);
                    setClickTooltip(info);
                    setTooltip(null);
                }
            },
            updateTriggers: {
                getFillColor: [normalizedData, currentIndicators],
                getLineColor: [normalizedData, currentIndicators],
                getLineWidth: [selectedCountryCode],
            },
        }),
    ];

    const mapTitle = () => {
        let colours = [];
        let titleStart = "";
        if (
            currentIndicators.bivariateXEnabled ||
            currentIndicators.bivariateYEnabled ||
            currentIndicators.mapVisualisationEnabled
        )
            titleStart = "Map shows ";
        if (currentIndicators.bivariateXEnabled)
            colours.push(currentIndicators.bivariateX.label.toUpperCase());
        if (currentIndicators.bivariateYEnabled)
            colours.push(currentIndicators.bivariateY.label.toUpperCase());
        let coloursText = colours.length > 0 ? colours.join(" and ") + " as colors" : "";
        if (currentIndicators.mapVisualisationEnabled) coloursText += ", and ";
        const overlayText = currentIndicators.mapVisualisationEnabled
            ? currentIndicators.mapVisualisation.label.toUpperCase() + " overlaid on top"
            : "";
        return titleStart + coloursText + overlayText;
    };

    return (
        <div className={styles.mapOuterContainer}>
            <div className={styles.mapTitle}>{mapTitle()}</div>
            <div className={styles.mapContainer} ref={mapContainerRef}>
                {viewport && (
                    <DeckGL
                        viewState={viewport}
                        controller={{ type: MapController, dragPan: !isMobile, scrollZoom: false }}
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
                    tooltip={clickTooltip || tooltip}
                    setClickTooltip={setClickTooltip}
                    isClickTooltip={Boolean(clickTooltip)}
                    normalizedData={normalizedData}
                    currentIndicators={currentIndicators}
                    goal={goal}
                    scales={scales}
                    mapContainerDimensions={mapContainerDimensions}
                    sourcesData={sourcesData}
                />
                <div className={styles.mapControls}>
                    <div className={styles.mapZoomButton} onClick={() => zoomIncrement(0.5)}>
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13 17V30H17V17H30V13H17V0H13V13H0V17H13Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <div className={styles.mapZoomButton} onClick={() => zoomIncrement(-0.5)}>
                        <svg width="30" height="4" viewBox="0 0 30 4" fill="none">
                            <rect width="30" height="4" fill="currentColor" />
                        </svg>
                    </div>
                </div>
                <div className={styles.loader} data-visible={loading}>
                    {/* todo: nicer loader. move up? */}
                    <h4>Loading...</h4>
                </div>
            </div>
            <small className={styles.mapDisclaimer}>
                The designations employed and the presentation of material on this map do not imply
                the expression of any opinion whatsoever on the part of the Secretariat of the
                United Nations or UNDP concerning the legal status of any country, territory, city
                or area or its authorities, or concerning the delimitation of its frontiers or
                boundaries.
            </small>
        </div>
    );
};

// TODO: module these
const getFormattedMapValue = (row, indicator) => {
    
    const val = getRowIndicatorValue(row, indicator);
    if (isNil(val) || val === "") return "-";
    let value = "";
    let extraValue = "";
    if (indicator.binary) {
        value = val ? "Yes" : "No";
    } else if (indicator.isDaysAgo) {
        value = val ? `${format(subDays(new Date(), val), "dd MMM yyyy")} (${val} days ago)` : "-";
    } else {
        value = typeof val === "string" ? val : indicator.tooltipExtraDataKey === "scale" ? indicator.format(val).replace("USD", "Billion USD") : indicator.format(val);
    }

    if (indicator.tooltipExtraDataKey && indicator.tooltipExtraDataKey !== "scale") {
        extraValue = ` (${row[indicator.tooltipExtraDataKey]})`;
    }

    return value + extraValue;
};

/*
const renderFormattedMapDate = (row, indicator) => {
    const date = row.dates[indicator.dataKey];
    const year = date ? date.getFullYear() : null;
    if (!year) return null;
    const lastUpdated =
        indicator.meta && indicator.meta.lastUpdated ? " (" + indicator.meta.lastUpdated + ")" : "";
    const dateStr = `${year}${lastUpdated}`;
    return <span className={styles.tooltipDatumDate}>{dateStr}</span>;
};
*/
const MapTooltip = props => {
    const {
        tooltip,
        setClickTooltip,
        isClickTooltip,
        normalizedData,
        currentIndicators,
        scales,
        mapContainerDimensions,
        sourcesData,
    } = props;

    const data = React.useMemo(() => {
        if (!tooltip) return null;
        return normalizedData[tooltip.object.properties[GEO_SHAPE_ID]];
    }, [tooltip, normalizedData]);

    const getSourceLastUpdated = sourceName => {
        const sourceMetaData = sourcesData.find(x => x["Data source name"] === sourceName);
        return (
            <span className={styles.tooltipDatumDate}>
                {sourceMetaData &&
                    sourceMetaData["Last updated start"] &&
                    `Last updated ${sourceMetaData["Last updated start"]}${
                        sourceMetaData["Last updated end"] &&
                        ` - ${sourceMetaData["Last updated end"]}`
                    }`}
            </span>
        );
    };

    if (!data) return null;

    const mapVisRow = currentIndicators.mapVisualisationEnabled &&
        currentIndicators.mapVisualisation && (
            <div className={styles.tooltipDatum}>
                <div
                    className={styles.tooltipDatumIcon}
                    data-radius={!currentIndicators.mapVisualisation.categorical}
                    data-category={currentIndicators.mapVisualisation.categorical}
                />
                <div className={styles.tooltipDatumText}>
                    <div>
                        {getSourceLastUpdated(
                            currentIndicators.mapVisualisation.meta.sources[0].name
                        )}
                    </div>
                    <div className={styles.tooltipDatumLabel}>
                        {currentIndicators.mapVisualisation.label}
                    </div>
                    <div className={styles.tooltipDatumValue}>
                        {getFormattedMapValue(data, currentIndicators.mapVisualisation)}
                    </div>
                </div>
            </div>
        );

    const bivariateXRow = currentIndicators.bivariateXEnabled && (
        <div className={styles.tooltipDatum}>
            <div
                className={styles.tooltipDatumIcon}
                data-bivariate
                style={{
                    background: scales.colorX(data),
                    borderColor: scales.colorX(data),
                }}
            />
            <div className={styles.tooltipDatumText}>
                <div>
                    {getSourceLastUpdated(currentIndicators.bivariateX.meta.sources[0].name)}
                </div>
                <div className={styles.tooltipDatumLabel}>
                    {currentIndicators.bivariateX.tableLabel
                        ? currentIndicators.bivariateX.tableLabel
                        : currentIndicators.bivariateX.label}
                </div>
                <div className={styles.tooltipDatumValue}>
                    {getFormattedMapValue(data, currentIndicators.bivariateX)}
                </div>
            </div>
        </div>
    );

    const bivariateYRow = currentIndicators.bivariateYEnabled && (
        <div className={styles.tooltipDatum}>
            <div
                className={styles.tooltipDatumIcon}
                data-bivariate
                style={{
                    background: scales.colorY(data),
                    borderColor: scales.colorY(data),
                }}
            />
            <div className={styles.tooltipDatumText}>
                <div>
                    {getSourceLastUpdated(currentIndicators.bivariateY.meta.sources[0].name)}
                </div>
                <div className={styles.tooltipDatumLabel}>{currentIndicators.bivariateY.label}</div>
                <div className={styles.tooltipDatumValue}>
                    {getFormattedMapValue(data, currentIndicators.bivariateY)}
                </div>
            </div>
        </div>
    );

    const clampedLeft = `min(${tooltip.x}px, calc(${mapContainerDimensions.width}px - 100%))`;
    const clampedY = `min(${tooltip.y}px, calc(${mapContainerDimensions.height}px - 100%))`;
    const transform = `translate(${clampedLeft}, ${clampedY})`;

    const clickTrap = isClickTooltip && (
        <div className={styles.tooltipClickTrap} onClick={() => setClickTooltip(null)} />
    );

    const link = isClickTooltip && (
        <a className={styles.tooltipLink} href={`/country/${data["CMS slug"]}`}>
            View country data <Chevron />
        </a>
    );

    return (
        <>
            {clickTrap}
            <div
                className={styles.tooltip}
                style={{
                    transform,
                }}
                data-click={isClickTooltip}
            >
                <div className={styles.tooltipHeader}>
                    <div className={styles.tooltipHeading}>{data["Country or Area"]}</div>
                    {isClickTooltip && (
                        <div className={styles.tooltipClose} onClick={() => setClickTooltip(null)}>
                            <Plus />
                        </div>
                    )}
                </div>
                <div className={styles.tooltipBody}>
                    {mapVisRow}
                    {bivariateXRow}
                    {bivariateYRow}
                </div>
                {link}
            </div>
        </>
    );
};

// const circlePadding = 2; // this includes the stroke
const circleRadius = 4;
const circleRadiusInactive = 3;
const CircleVis = props => {
    const { viewport, scales, normalizedData, currentIndicators } = props;

    const indicator = React.useMemo(() => currentIndicators.mapVisualisation, [currentIndicators]);

    const uniqueVals = React.useMemo(() => {
        if (!indicator || !(indicator.categorical || indicator.binary)) return null;
        return uniq(
            flatten(
                Object.values(normalizedData).map(d => {
                    const val = getRowIndicatorValue(d, indicator);
                    if (isNil(val)) return null;
                    return indicator.binary ? (val === 1 ? "Yes" : "No") : categorySplit(val);
                })
            ).filter(d => d && d.length)
        );
    }, [normalizedData, indicator]);
    const rowXY = row => {
        const [lng, lat] = [row["Longitude (average)"], row["Latitude (average)"]];
        if ([lng, lat].some(d => !d)) return null;
        return viewport.project([lng, lat]);
    };

    if (!currentIndicators.mapVisualisationEnabled) return null;

    let content = null;

    if (indicator.categorical || indicator.binary) {
        // const numCircles = uniqueVals.length;
        // const minimumCircumference = numCircles * (circleRadius + circlePadding * 2);
        // const groupRadius = minimumCircumference / (Math.PI * 2);
        // const angleEach = 360 / numCircles;

        const groups = Object.values(normalizedData).map(row => {
            const val = getRowIndicatorValue(row, indicator);
            if (isNil(val)) return null;
            const cats = indicator.binary ? (val === 1 ? "Yes" : "No") : categorySplit(val);
            const xy = rowXY(row);
            if (!xy) return null;

            const groupCircles = (indicator.binary ? ["Yes", "No"] : uniqueVals.sort()).map(
                (cat, i) => {
                    // const a = i * angleEach - 90;
                    const active = cats.includes(cat);
                    if (!active) return null;
                    return (
                        <circle
                            key={row[SHEET_ROW_ID] + cat}
                            className={styles.visCategoryCircle}
                            data-i={i}
                            data-active={active}
                            data-gradient={indicator.isGradient}
                            data-binary={indicator.binary}
                            r={active ? circleRadius : circleRadiusInactive}
                            // style={{
                            //     transform: `rotate(${a}deg) translateX(${groupRadius}px)`,
                            // }}
                        />
                    );
                }
            );

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
    } else if (currentIndicators.mapVisualisationEnabled) {
        const circles = Object.values(normalizedData).map(row => {
            const xy = rowXY(row);
            if (!xy) return null;
            const [x, y] = xy;
            const r = scales.mapVisualisationRadius(row);
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
