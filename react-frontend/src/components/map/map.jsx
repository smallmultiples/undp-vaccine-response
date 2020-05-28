import React from "react";
import DeckGL, { GeoJsonLayer, Viewport, WebMercatorViewport } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import Geostats from "geostats";
import PILLARS from "../../config/pillars";

const DEFAULT_COLOUR = [242, 242, 242];
const SHEET_ROW_ID = "Alpha-3 code";
const GEO_SHAPE_ID = "ISO3";

const useDomains = (countryData, displaySettings) => {
    return React.useMemo(() => {
        const domainX = countryData
            ? extent(Object.values(countryData), d => d[displaySettings.variateXColumn])
            : [0, 1];
        const domainY = countryData
            ? extent(Object.values(countryData), d => d[displaySettings.variateYColumn])
            : [0, 1];

        return {
            variateX: domainX,
            variateY: domainY,
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
];

const bivariateColourMatrix = bivariateColourMatrixHex.map(row =>
    row.map(colour => hexToRgb(colour))
);

const useScales = displaySettings => {
    return React.useMemo(() => {
        const circleRadiusScale = scaleLinear().range([0, 16]).domain([0, 1]);

        const bivariateColourScale = row => {
            if (row.variateX === null || row.variateY === null) {
                return DEFAULT_COLOUR;
            }
            const maxIndex = bivariateColourMatrix.length - 1;

            const invX = displaySettings.variateXFlip ? 1 - row.variateX : row.variateX;
            const invY = displaySettings.variateYFlip ? 1 - row.variateY : row.variateY;

            const xIndex = Math.floor(invX * maxIndex);
            // input colours are from top to bottom, not bottom to top so we deduct
            const yIndex = maxIndex - Math.floor(invY * maxIndex);
            return bivariateColourMatrix[yIndex][xIndex];
        };

        return {
            radius: circleRadiusScale,
            color: bivariateColourScale,
        };
    }, [displaySettings.variateXFlip, displaySettings.variateYFlip]);
};

const getNormalFromJenks = (jenks, value) => {
    if (value === undefined) return null;
    const index = jenks.findIndex((j, i) => {
        const low = j;
        const top = jenks[i + 1];
        return value >= low && value <= top;
    });

    return index / (jenks.length - 2);
};

const useNormalizedData = (countryData, displaySettings) => {
    return React.useMemo(() => {
        if (!countryData) return {};

        const valuesX = Object.values(countryData)
            .map(raw => raw[displaySettings.variateXColumn])
            .filter(d => d !== undefined);
        const valuesY = Object.values(countryData)
            .map(raw => raw[displaySettings.variateYColumn])
            .filter(d => d !== undefined);

        // TODO: hate this. should be done in domains.
        const geostatsX = new Geostats(valuesX);
        const geostatsY = new Geostats(valuesY);

        const jenksX = geostatsX.getClassJenks(5);
        const jenksY = geostatsY.getClassJenks(5);

        // TODO: i hate this. use a real scale.
        const normalizeCircleValue = scaleLinear()
            .range([0, 1])
            .domain(
                extent(Object.values(countryData), raw => raw[displaySettings.circleSizeColumn])
            );

        let ret = {};
        Object.values(countryData).forEach(raw => {
            ret[raw[SHEET_ROW_ID]] = {
                ...raw,
                variateX: getNormalFromJenks(jenksX, raw[displaySettings.variateXColumn]),
                variateY: getNormalFromJenks(jenksY, raw[displaySettings.variateYColumn]),
                circleValue: normalizeCircleValue(raw[displaySettings.circleSizeColumn]),
            };
        });
        return ret;
    }, [countryData, displaySettings.variateXColumn, displaySettings.variateYColumn]);
};

const useGeoData = () => {
    const [shapeData, setShapeData] = React.useState(null);
    const [centroidData, setCentroidData] = React.useState(null);

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
    const { countryData, countryDataLoading } = props;

    return (
        <div>
            <PillarControl {...props} />
            <PillarInfo {...props} />
            <MapVis countryData={countryData} countryDataLoading={countryDataLoading} />
        </div>
    );
};

const PillarControl = props => {
    const { activePillar, setActivePillar } = props;
    // This component is the selector for the pillar just under the header.
    return (
        <div className={styles.pillarControl}>
            <p className={styles.pillarLabel}>
                Leading the recovery effort by assessing and supporting countries in the following
                areas:
            </p>
            <div className={styles.pillarButtons}>
                {Object.values(PILLARS).map(pillar => {
                    const selected = pillar === activePillar;
                    return (
                        <button
                            key={pillar.labelShort}
                            className={styles.pillarButton}
                            onClick={() => setActivePillar(pillar)}
                            data-selected={selected}
                        >
                            {pillar.labelShort}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const PillarInfo = props => {
    const { activePillar } = props;

    return (
        <div className={styles.pillarInfo}>
            <div className={styles.pillarInfoText}>
                <div className={styles.pillarHeading}>{activePillar.label}</div>
                <p className={styles.pillarDescription}>{activePillar.description}</p>
            </div>
            <div className={styles.pillarIndicators}>Add indicator dropdown here</div>
        </div>
    );
};

const MapVis = props => {
    const { countryData, countryDataLoading } = props;
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

    // TODO: refactor this using the pillar.
    const displaySettings = React.useMemo(
        () => ({
            variateXColumn: "Hospital beds",
            variateXFlip: true,
            variateYColumn: "test_death_rate",
            variateYFlip: false,
            circleSizeColumn: "Physicians",
        }),
        []
    );
    const { shapeData, loading: geoLoading } = useGeoData();
    const domains = useDomains(countryData, displaySettings);
    const scales = useScales(displaySettings);
    const normalizedData = useNormalizedData(countryData, displaySettings);

    const loading = [geoLoading, countryDataLoading].some(d => d);

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: shapeData,
            filled: true,
            getFillColor: shape => {
                const row = normalizedData[shape.properties[GEO_SHAPE_ID]];
                if (!row) {
                    return DEFAULT_COLOUR;
                }
                return scales.color(row);
            },
            stroked: true,
            getLineColor: [255, 255, 255],
            lineWidthMinPixels: 0.5,
            pickable: true,
            onHover: info => (info.object ? setTooltip(info) : setTooltip(null)),
            updateTriggers: {
                getFillColor: [normalizedData],
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
                {viewport && (
                    <CircleVis
                        viewport={viewport}
                        scales={scales}
                        normalizedData={normalizedData}
                    />
                )}
                <BivariateLegendOverlay displaySettings={displaySettings} />
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
                        {data[displaySettings.variateXColumn].toFixed(1)}
                    </div>
                    <div className={styles.tooltipDatumLabel}>{displaySettings.variateXColumn}</div>
                </div>
                <div className={styles.tooltipDatum}>
                    <div className={styles.tooltipDatumValue}>
                        {data[displaySettings.variateYColumn].toFixed(1)}
                    </div>
                    <div className={styles.tooltipDatumLabel}>{displaySettings.variateYColumn}</div>
                </div>
            </div>
        </div>
    );
};

const BivariateLegendOverlay = props => {
    const { displaySettings } = props;
    return (
        <div className={styles.bivariateLegend}>
            <div className={styles.legendColourLabel} data-y={true}>
                {displaySettings.variateYColumn}
            </div>
            <div className={styles.legendColourLabel} data-x={true}>
                {displaySettings.variateXColumn}
            </div>
            <div></div>
            <div className={styles.legendColour}>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][0] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][2] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[0][4] }}
                    />
                </div>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][0] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][2] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[2][4] }}
                    />
                </div>
                <div className={styles.legendColourRow}>
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][0] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][2] }}
                    />
                    <div
                        className={styles.legendColourCell}
                        style={{ background: bivariateColourMatrixHex[4][4] }}
                    />
                </div>
            </div>
        </div>
    );
};

const CircleVis = props => {
    const { viewport, scales, normalizedData } = props;

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
