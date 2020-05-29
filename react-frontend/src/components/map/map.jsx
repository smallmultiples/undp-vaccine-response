import React from "react";
import DeckGL, { GeoJsonLayer, Viewport, WebMercatorViewport } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map.module.scss";
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

const useDomains = (countryData, displaySettings) => {
    return React.useMemo(() => {
        const valuesX = countryData
            ? Object.values(countryData)
                  .map(raw => raw[displaySettings.variateXColumn])
                  .filter(d => d !== undefined)
            : [];
        const valuesY = countryData
            ? Object.values(countryData)
                  .map(raw => raw[displaySettings.variateYColumn])
                  .filter(d => d !== undefined)
            : [];
        const valuesCircle = countryData
            ? Object.values(countryData)
                  .map(raw => raw[displaySettings.circleRadiusColumn])
                  .filter(d => d !== undefined)
            : [];

        let jenksX = [],
            jenksY = [];

        if (countryData) {
            const geostatsX = new Geostats(valuesX);
            const geostatsY = new Geostats(valuesY);

            jenksX = geostatsX.getClassJenks(5);
            jenksY = geostatsY.getClassJenks(5);
        }

        return {
            values: {
                x: valuesX,
                y: valuesY,
                circle: valuesCircle,
            },
            extents: {
                circle: extent(valuesCircle),
            },
            jenks: {
                x: jenksX,
                y: jenksY,
            },
        };
    }, [countryData, displaySettings]);
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}

const bivariateColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#0BC6FF", "#41D0FC", "#7FDCF9", "#BAE7F6", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const bivariateColourMatrix = bivariateColourMatrixHex.map(row =>
    row.map(colour => hexToRgb(colour))
);

const useScales = (domains, displaySettings) => {
    return React.useMemo(() => {
        const circleRadiusScale = scaleLog().range([0, 16]).domain(domains.extents.circle);

        const bivariateColourScale = row => {
            // Nulls based on enabled variates
            if (displaySettings.variateXEnable && displaySettings.variateYEnable) {
                if (row.variateX === null || row.variateY === null) return NULL_SHAPE_FILL;
            }
            if (displaySettings.variateXEnable && !displaySettings.variateYEnable) {
                if (row.variateX === null) return NULL_SHAPE_FILL;
            }
            if (!displaySettings.variateXEnable && displaySettings.variateYEnable) {
                if (row.variateY === null) return NULL_SHAPE_FILL;
            }

            const maxIndex = bivariateColourMatrix.length - 1;

            // Default to bottom/left cell
            let xIndex = 0;
            let yIndex = maxIndex;

            if (displaySettings.variateXEnable) {
                xIndex = Math.floor(row.variateX * maxIndex);
            }
            if (displaySettings.variateYEnable) {
                // input colours are from top to bottom, not bottom to top so we deduct
                yIndex = maxIndex - Math.floor(row.variateY * maxIndex);
            }

            return bivariateColourMatrix[yIndex][xIndex];
        };

        const strokeScale = row => {
            if (displaySettings.variateXEnable && displaySettings.variateYEnable) {
                if (row.variateX === null || row.variateY === null) return NULL_SHAPE_STROKE;
            }
            if (displaySettings.variateXEnable && !displaySettings.variateYEnable) {
                if (row.variateX === null) return NULL_SHAPE_STROKE;
            }
            if (!displaySettings.variateXEnable && displaySettings.variateYEnable) {
                if (row.variateY === null) return NULL_SHAPE_STROKE;
            }
            return GOOD_SHAPE_STROKE;
        };

        return {
            radius: circleRadiusScale,
            color: bivariateColourScale,
            stroke: strokeScale,
        };
    }, [domains, displaySettings.variateXEnable, displaySettings.variateYEnable]);
};

const getNormalFromJenks = (jenks, value, flip = false) => {
    if (value === undefined) return null;
    const index = jenks.findIndex((j, i) => {
        const low = j;
        const top = jenks[i + 1];
        return value >= low && value <= top;
    });

    const v = index / (jenks.length - 2);
    return flip ? 1 - v : v;
};

const useNormalizedData = (countryData, domains, displaySettings) => {
    return React.useMemo(() => {
        if (!countryData) return {};

        let ret = {};
        Object.values(countryData).forEach(raw => {
            ret[raw[SHEET_ROW_ID]] = {
                ...raw,
                variateX: getNormalFromJenks(
                    domains.jenks.x,
                    raw[displaySettings.variateXColumn],
                    displaySettings.variateXFlip
                ),
                variateY: getNormalFromJenks(
                    domains.jenks.y,
                    raw[displaySettings.variateYColumn],
                    displaySettings.variateYFlip
                ),
                circleValue: raw[displaySettings.circleRadiusColumn],
            };
        });
        return ret;
    }, [
        countryData,
        displaySettings.variateXColumn,
        displaySettings.variateYColumn,
        displaySettings.circleRadiusColumn,
    ]);
};

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

const Map = props => {
    return (
        <div>
            <MapVis {...props} />
        </div>
    );
};

const MapVis = props => {
    const { countryData, countryDataLoading, activeIndicator } = props;
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewport, setViewport] = React.useState(null);
    const [tooltip, setTooltip] = React.useState(null);
    const [bivariateEnableX, setBivariateEnableX] = React.useState(true);
    const [bivariateEnableY, setBivariateEnableY] = React.useState(true);

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

    const displaySettings = React.useMemo(
        () => ({
            variateXColumn: "Hospital beds",
            variateXFlip: false,
            variateXEnable: bivariateEnableX,
            variateYColumn: "test_death_rate",
            variateYFlip: false,
            variateYEnable: bivariateEnableY,
            circleRadiusColumn: activeIndicator, // TODO: refactor better.
        }),
        [bivariateEnableX, bivariateEnableY, activeIndicator]
    );
    const { shapeData, loading: geoLoading } = useGeoData();
    const domains = useDomains(countryData, displaySettings);
    const scales = useScales(domains, displaySettings);
    const normalizedData = useNormalizedData(countryData, domains, displaySettings);

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
                getFillColor: [normalizedData, bivariateEnableX, bivariateEnableY],
                getLineColor: [normalizedData, bivariateEnableX, bivariateEnableY],
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
                <BivariateLegendOverlay
                    displaySettings={displaySettings}
                    domains={domains}
                    {...{
                        bivariateEnableX,
                        bivariateEnableY,
                        setBivariateEnableX,
                        setBivariateEnableY,
                    }}
                />
                <MapTooltip
                    tooltip={tooltip}
                    normalizedData={normalizedData}
                    displaySettings={displaySettings}
                />
                <div className={styles.loader} data-visible={loading}>
                    {/* todo: nicer loader */}
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

const BivariateLegendOverlay = props => {
    const {
        displaySettings,
        bivariateEnableX,
        bivariateEnableY,
        setBivariateEnableX,
        setBivariateEnableY,
    } = props;
    const { jenks } = props.domains;
    // TODO: format properly

    const xOnlyDisabled = !bivariateEnableX && bivariateEnableY;
    const yOnlyDisabled = !bivariateEnableY && bivariateEnableX;
    const bothDisabled = !bivariateEnableX && !bivariateEnableY;
    const eitherDisabled = !bivariateEnableX || !bivariateEnableY;

    const x0 = formatNumTemp(jenks.x[0]);
    const x1 = formatNumTemp(jenks.x[jenks.x.length - 1]);
    const y0 = formatNumTemp(jenks.y[0]);
    const y1 = formatNumTemp(jenks.y[jenks.y.length - 1]);
    return (
        <div className={styles.bivariateLegend}>
            <div
                className={styles.legendColourLabel}
                data-x={true}
                data-enabled={bivariateEnableX}
                onClick={() => setBivariateEnableX(d => !d)}
            >
                {displaySettings.variateXColumn}
            </div>
            <div
                className={styles.legendColourLabel}
                data-y={true}
                data-enabled={bivariateEnableY}
                onClick={() => setBivariateEnableY(d => !d)}
            >
                {displaySettings.variateYColumn}
            </div>
            <div className={styles.legendColourSpan} data-x={true}>
                <div className={styles.legendColourSpanValue}>
                    <IconArrowLeft />
                    <span>{displaySettings.variateXFlip ? x1 : x0}</span>
                </div>
                <div className={styles.legendColourSpanValue}>
                    <span>{displaySettings.variateXFlip ? x0 : x1}</span>
                    <IconArrowRight />
                </div>
            </div>
            <div className={styles.legendColourSpan} data-y={true}>
                <div className={styles.legendColourSpanValue}>
                    <IconArrowLeft />
                    <span>{displaySettings.variateYFlip ? y1 : y0}</span>
                </div>
                <div className={styles.legendColourSpanValue}>
                    <span>{displaySettings.variateYFlip ? y0 : y1}</span>
                    <IconArrowRight />
                </div>
            </div>

            <div className={styles.legendColour}>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][0] }}
                        data-disabled={bothDisabled || yOnlyDisabled}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][2] }}
                        data-disabled={eitherDisabled}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][4] }}
                        data-disabled={eitherDisabled}
                    />
                </div>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][0] }}
                        data-disabled={bothDisabled || yOnlyDisabled}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][2] }}
                        data-disabled={eitherDisabled}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][4] }}
                        data-disabled={eitherDisabled}
                    />
                </div>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][0] }}
                        data-disabled={false}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][2] }}
                        data-disabled={bothDisabled || xOnlyDisabled}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][4] }}
                        data-disabled={bothDisabled || xOnlyDisabled}
                    />
                </div>
            </div>
        </div>
    );
};

const CircleVis = props => {
    const { viewport, scales, normalizedData, displaySettings } = props;

    if (!displaySettings.circleRadiusColumn) return null;

    const circles = Object.values(normalizedData).map(row => {
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

export default Map;
