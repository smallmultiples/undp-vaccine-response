import { extent, quantile } from "d3-array";
import { scaleLinear } from "d3-scale";
import { isNil, last } from "lodash";
import React from "react";
import { HDI_BUCKETS } from "../../config/scales";
import useMediaQuery from "../../hooks/use-media-query";
import { hexToRgb, getRowIndicatorValue } from "../../modules/utils";
import MapFiltersLegends, {
    MapFiltersLegendMobile,
} from "../map-filters-legends/map-filters-legends";
import MapVis from "../map-vis/map-vis";
import styles from "./map.module.scss";

const GOOD_SHAPE_STROKE = [255, 255, 255];
const NULL_SHAPE_FILL = [255, 255, 255]; // #FFFFFF
const NULL_SHAPE_STROKE = [225, 225, 225];
// If true, pink is left, if false pink is right
const FLIP_COLOURS_HORIZONTALLY = true;
// Whether to use a quantile scale. Uses linear ranges if false.
const USE_QUANTILE = true;

const useDomains = (countryData, currentIndicators) => {
    return React.useMemo(() => {
        const ready =
            countryData &&
            currentIndicators.bivariateX &&
            currentIndicators.bivariateY &&
            currentIndicators.mapVisualisation;

        const valuesX = ready
            ? Object.values(countryData)
                  .map(row => getRowIndicatorValue(row, currentIndicators.bivariateX))
                  .filter(d => d !== undefined && d !== "")
                  .sort((a, b) => a - b)
            : [];
        const valuesY = ready
            ? Object.values(countryData)
                  .map(row => getRowIndicatorValue(row, currentIndicators.bivariateY))
                  .filter(d => d !== undefined && d !== "")
                  .sort((a, b) => a - b)
            : [];
        const valuesMapVis = ready
            ? Object.values(countryData)
                  .map(row => getRowIndicatorValue(row, currentIndicators.mapVisualisation))
                  .filter(d => d !== undefined && d !== "")
            : [];

        let jenksX = [],
            jenksY = [];

        if (ready) {
            const xHdi = currentIndicators.bivariateX.hdi;
            const yHdi = currentIndicators.bivariateY.hdi;

            if (xHdi) {
                jenksX = HDI_BUCKETS;
            } else {
                if (USE_QUANTILE) {
                    jenksX = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(p => quantile(valuesX, p));
                } else {
                    const extents = extent(valuesX);
                    const scale = scaleLinear().range(extents).domain([0, 1]);
                    jenksX = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(d => scale(d));
                }
            }

            if (yHdi) {
                jenksY = HDI_BUCKETS;
            } else {
                if (USE_QUANTILE) {
                    jenksY = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(p => quantile(valuesY, p));
                } else {
                    const extents = extent(valuesY);
                    const scale = scaleLinear().range(extents).domain([0, 1]);
                    jenksY = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(d => scale(d));
                }
            }
        }

        return {
            values: {
                x: valuesX,
                y: valuesY,
                mapVisualisation: valuesMapVis,
            },
            extents: {
                mapVisualisation: extent(valuesMapVis),
            },
            categories: {
                x: jenksX,
                y: jenksY,
            },
        };
    }, [countryData, currentIndicators]);
};

const blueLightColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#0BC6FF", "#41D0FC", "#7FDCF9", "#BAE7F6", "#FF0000"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const blueLightColourMatrixCornerColours = {
    x: "#def3fa",
    y: "#f7e1e8",
    xy: "#e9e8fc",
};

const yellowColourMatrixHex = [
    ["#F0B110", "#F19935", "#F2894F", "#F37967", "#F4618D"],
    ["#E9BE0F", "#ECAE3F", "#EEA35F", "#F1957C", "#F782A5"],
    ["#E1CE0E", "#E7C349", "#EBBB6E", "#EFB290", "#F99FBA"],
    ["#D9DF0D", "#E1DA54", "#E7D27D", "#ECD1A7", "#F6C5D4"],
    ["#D0F00C", "#DCF15F", "#E3F190", "#EAF2BF", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const yellowColourMatrixCornerColours = {
    x: "#f1f5df",
    y: "#f7e1e8",
    xy: "#f5eada",
};

const hdiColorMatrixHex = [
    ["#EDD0C1", "#F1EBC8", "#EAEED3", "#CBE2D2"],
    ["#EBBCA5", "#F1E5AB", "#E4EBB9", "#B2D7BE"],
    ["#E7A584", "#F0DF87", "#DDE79C", "#98CDA8"],
    ["#E49066", "#F0DA69", "#D6E480", "#7FC293"],
    ["#E07038", "#EFD54D", "#D1E16A", "#60B579"],
];

const colourMatricesHex = {
    "vaccine-equity": blueLightColourMatrixHex,
    accessibility: blueLightColourMatrixHex,
    affordability: yellowColourMatrixHex,
};

const colourMatricesCornerColours = {
    "vaccine-equity": blueLightColourMatrixCornerColours,
    accessibility: blueLightColourMatrixCornerColours,
    affordability: yellowColourMatrixCornerColours,
};

const getNormalFromJenks = (jenks, value, flip = false) => {
    if (isNil(value)) return null;
    const index = jenks.findIndex((j, i) => {
        const low = j;
        const top = jenks[i + 1];
        return value >= low && value <= top;
    });

    const v = index / (jenks.length - 2);
    const clamped = Math.min(Math.max(v, 0), 1);
    return flip ? 1 - clamped : clamped;
};

const getColorMatrices = (pillar, goal, currentIndicators) => {
    const xHdi = currentIndicators.bivariateX.hdi && currentIndicators.bivariateXEnabled;
    const yHdi = currentIndicators.bivariateY.hdi && currentIndicators.bivariateYEnabled;
    let colorMatrixHex = colourMatricesHex[pillar.label];
    let cornerColours = colourMatricesCornerColours[pillar.label];

    if (goal) {
        colorMatrixHex = colourMatricesHex[goal.slug];
        cornerColours = colourMatricesCornerColours[goal.slug];
    }

    if (currentIndicators.bivariateXEnabled && !currentIndicators.bivariateYEnabled) {
        if (FLIP_COLOURS_HORIZONTALLY) {
            colorMatrixHex[4][0] = cornerColours.x;
        } else {
            colorMatrixHex[4][4] = cornerColours.x;
        }
    } else if (!currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
        if (FLIP_COLOURS_HORIZONTALLY) {
            colorMatrixHex[4][0] = cornerColours.y;
        } else {
            colorMatrixHex[4][4] = cornerColours.y;
        }
    } else if (currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
        if (FLIP_COLOURS_HORIZONTALLY) {
            colorMatrixHex[4][0] = cornerColours.xy;
        } else {
            colorMatrixHex[4][4] = cornerColours.xy;
        }
    }

    if (xHdi && yHdi) {
        colorMatrixHex = [
            last(hdiColorMatrixHex),
            last(hdiColorMatrixHex),
            last(hdiColorMatrixHex),
            last(hdiColorMatrixHex),
        ];
    } else if (xHdi) {
        colorMatrixHex = hdiColorMatrixHex;
    } else if (yHdi) {
        // Transpose the matrix and reverse.
        colorMatrixHex = hdiColorMatrixHex[0]
            .map((x, i) => hdiColorMatrixHex.map(x => x[i]).reverse())
            .reverse();
    }

    const colorMatrix = colorMatrixHex.map(row => row.map(hexToRgb));

    return {
        colorMatrix,
        colorMatrixHex,
    };
};

const nullValue = val => isNil(val) || val === "";

const areaToRadius = area => Math.sqrt(area / Math.PI);

const useScales = (domains, currentIndicators, pillar, goal) => {
    return React.useMemo(() => {
        const circleScale = scaleLinear()
            .range([30, 1000])
            .domain(domains.extents.mapVisualisation);
        const mapVisualisationRadiusScale = row => {
            const area = circleScale(getRowIndicatorValue(row, currentIndicators.mapVisualisation));
            return areaToRadius(area);
        };
        mapVisualisationRadiusScale.range = () => circleScale.range().map(areaToRadius);
        mapVisualisationRadiusScale.domain = circleScale.domain;

        let { colorMatrix, colorMatrixHex } = getColorMatrices(pillar, goal, currentIndicators);
        const maxIndexX = colorMatrix[0].length - 1;
        const maxIndexY = colorMatrix.length - 1;

        const bivariateColourScale = row => {
            if (!row) return NULL_SHAPE_FILL;
            const valX = getRowIndicatorValue(row, currentIndicators.bivariateX);
            const valY = getRowIndicatorValue(row, currentIndicators.bivariateY);

            // Nulls based on enabled variates
            if (currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (nullValue(valX) || nullValue(valY)) return NULL_SHAPE_FILL;
            }
            if (currentIndicators.bivariateXEnabled && !currentIndicators.bivariateYEnabled) {
                if (nullValue(valX)) return NULL_SHAPE_FILL;
            }
            if (!currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (nullValue(valY)) return NULL_SHAPE_FILL;
            }

            const normX = getNormalFromJenks(
                domains.categories.x,
                valX,
                currentIndicators.bivariateX.flipped
            );
            const normY = getNormalFromJenks(
                domains.categories.y,
                valY,
                currentIndicators.bivariateY.flipped
            );

            // Default to bottom/left cell
            let xIndex = 0;
            let yIndex = maxIndexY;

            if (currentIndicators.bivariateXEnabled) {
                xIndex = Math.floor(normX * maxIndexX);
            }
            if (currentIndicators.bivariateYEnabled) {
                // input colours are from top to bottom, not bottom to top so we deduct
                yIndex = maxIndexY - Math.floor(normY * maxIndexY);
            }

            return colorMatrix[yIndex][xIndex];
        };

        const xColourScale = row => {
            if (!row) return NULL_SHAPE_FILL;
            const valX = getRowIndicatorValue(row, currentIndicators.bivariateX);
            if (nullValue(valX)) return NULL_SHAPE_FILL;

            const normX = getNormalFromJenks(
                domains.categories.x,
                valX,
                currentIndicators.bivariateX.flipped
            );

            // Default to bottom/left cell
            let xIndex = 0;
            let yIndex = maxIndexY;

            if (currentIndicators.bivariateXEnabled) {
                xIndex = Math.floor(normX * maxIndexX);
            }
            return colorMatrixHex[yIndex][xIndex];
        };

        const yColourScale = row => {
            if (!row) return NULL_SHAPE_FILL;
            const valY = getRowIndicatorValue(row, currentIndicators.bivariateY);

            if (nullValue(valY)) return NULL_SHAPE_FILL;

            const normY = getNormalFromJenks(
                domains.categories.y,
                valY,
                currentIndicators.bivariateY.flipped
            );

            // Default to bottom/left cell
            let xIndex = 0;
            let yIndex = maxIndexY;
            if (currentIndicators.bivariateYEnabled) {
                // input colours are from top to bottom, not bottom to top so we deduct
                yIndex = maxIndexY - Math.floor(normY * maxIndexY);
            }

            return colorMatrixHex[yIndex][xIndex];
        };

        const strokeScale = row => {
            if (!row) return NULL_SHAPE_STROKE;
            const valX = getRowIndicatorValue(row, currentIndicators.bivariateX);
            const valY = getRowIndicatorValue(row, currentIndicators.bivariateY);
            if (currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (nullValue(valX) || nullValue(valY)) return NULL_SHAPE_STROKE;
            }
            if (currentIndicators.bivariateXEnabled && !currentIndicators.bivariateYEnabled) {
                if (nullValue(valX)) return NULL_SHAPE_STROKE;
            }
            if (!currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (nullValue(valY)) return NULL_SHAPE_STROKE;
            }
            return GOOD_SHAPE_STROKE;
        };

        return {
            mapVisualisationRadius: mapVisualisationRadiusScale,
            color: bivariateColourScale,
            stroke: strokeScale,
            colorMatrix: colorMatrixHex,
            colorX: xColourScale,
            colorY: yColourScale,
        };
    }, [domains, currentIndicators, pillar, goal]);
};

const Map = props => {
    const { currentIndicators, countryData, pillar, goal, sourcesData } = props;
    const domains = useDomains(countryData, currentIndicators);
    const scales = useScales(domains, currentIndicators, pillar, goal);

    const { isMobile } = useMediaQuery();

    return (
        <div className={styles.map}>
            {!isMobile && scales && countryData && (
                <MapFiltersLegends
                    domains={domains}
                    scales={scales}
                    normalizedData={countryData}
                    {...props}
                />
            )}
            <MapVis
                {...props}
                domains={domains}
                scales={scales}
                normalizedData={countryData}
                sourcesData={sourcesData}
            />
            {isMobile && (
                <MapFiltersLegendMobile
                    domains={domains}
                    scales={scales}
                    normalizedData={countryData}
                    {...props}
                />
            )}
        </div>
    );
};

export default Map;
