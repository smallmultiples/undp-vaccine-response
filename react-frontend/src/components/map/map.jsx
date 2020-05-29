import React from "react";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleSymlog, scaleLinear } from "d3-scale";
import Geostats from "geostats";
import MapVis from "../map-vis/map-vis";
import MapFiltersLegends from "../map-filters-legends/map-filters-legends";

const GOOD_SHAPE_STROKE = [255, 255, 255];
const NULL_SHAPE_FILL = [255, 255, 255]; // #FFFFFF
const NULL_SHAPE_STROKE = [233, 236, 246]; // #E9ECF6
// If true, pink is left, if false pink is right
const FLIP_COLOURS_HORIZONTALLY = true;

const useDomains = (countryData, currentIndicators) => {
    return React.useMemo(() => {
        const ready =
            countryData &&
            currentIndicators.bivariateX &&
            currentIndicators.bivariateY &&
            currentIndicators.radius;

        const valuesX = ready
            ? Object.values(countryData)
                  .map((raw) => raw[currentIndicators.bivariateX.dataKey])
                  .filter((d) => d !== undefined)
            : [];
        const valuesY = ready
            ? Object.values(countryData)
                  .map((raw) => raw[currentIndicators.bivariateY.dataKey])
                  .filter((d) => d !== undefined)
            : [];
        const valuesRadius = ready
            ? Object.values(countryData)
                  .map((raw) => raw[currentIndicators.radius.dataKey])
                  .filter((d) => d !== undefined)
            : [];

        let jenksX = [],
            jenksY = [];

        if (ready) {
            const geostatsX = new Geostats(valuesX);
            const geostatsY = new Geostats(valuesY);

            jenksX = geostatsX.getClassJenks(5);
            jenksY = geostatsY.getClassJenks(5);
        }

        return {
            values: {
                x: valuesX,
                y: valuesY,
                radius: valuesRadius,
            },
            extents: {
                radius: extent(valuesRadius),
            },
            categories: {
                x: jenksX,
                y: jenksY,
            },
        };
    }, [countryData, currentIndicators]);
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map((n) => parseInt(n, 16)) : null;
}

const bivariateColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#0BC6FF", "#41D0FC", "#7FDCF9", "#BAE7F6", "#F2F2F3"],
].map((d) => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const protectColourMatrixHex = [
    ["#008F36", "#069172", "#0A919B", "#1192C3", "#1793EB"],
    ["#00A036", "#17A472", "#24A69B", "#36A8C3", "#46AAEB"],
    ["#00B136", "#24B772", "#40BB9B", "#24B772", "#00B136"],
    ["#00C236", "#35CB72", "#59CF9B", "#7DD4C3", "#F6C5D4"],
    ["#00D336", "#45DE72", "#73E49B", "#A0EAC3", "#CEF0EB"],
].map((d) => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const HDIColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#F16821", "#F3D516", "#CBE350", "#2EB872", "#2EB872"],
];

const bivariateColourMatrix = bivariateColourMatrixHex.map((row) =>
    row.map((colour) => hexToRgb(colour))
);

const HDIColourMatrix = HDIColourMatrixHex.map((row) =>
    row.map((colour) => hexToRgb(colour))
);

const protectColourMatrix = protectColourMatrixHex.map((row) =>
    row.map((colour) => hexToRgb(colour))
);

const colourMatrices = {
    Health: bivariateColourMatrix,
    Protect: protectColourMatrix,
    "Human Development Index": HDIColourMatrix,
    Economic: bivariateColourMatrix,
    Macro: bivariateColourMatrix,
    Cohesion: bivariateColourMatrix,
};

const colourMatricesHex = {
    Health: bivariateColourMatrixHex,
    Protect: protectColourMatrixHex,
    "Human Development Index": HDIColourMatrixHex,
    Economic: bivariateColourMatrixHex,
    Macro: bivariateColourMatrixHex,
    Cohesion: bivariateColourMatrixHex,
};

const getRowIndicatorValue = (row, indicator) => {
    return row[indicator.dataKey];
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

const useScales = (domains, currentIndicators, activePillar) => {
    return React.useMemo(() => {
        const circleScale = scaleSymlog()
            .range([0, 16])
            .domain(domains.extents.radius);
        const circleRadiusScale = (row) =>
            circleScale(getRowIndicatorValue(row, currentIndicators.radius));

        const bivariateColourScale = (row) => {
            if (!row) return NULL_SHAPE_FILL;
            const valX = getRowIndicatorValue(
                row,
                currentIndicators.bivariateX
            );
            const valY = getRowIndicatorValue(
                row,
                currentIndicators.bivariateY
            );

            // Nulls based on enabled variates
            if (
                currentIndicators.bivariateXEnabled &&
                currentIndicators.bivariateYEnabled
            ) {
                if (valX === null || valY === null) return NULL_SHAPE_FILL;
            }
            if (
                currentIndicators.bivariateXEnabled &&
                !currentIndicators.bivariateYEnabled
            ) {
                if (valX === null) return NULL_SHAPE_FILL;
            }
            if (
                !currentIndicators.bivariateXEnabled &&
                currentIndicators.bivariateYEnabled
            ) {
                if (valY === null) return NULL_SHAPE_FILL;
            }

            // hack for friday
            const uniqueColourMatrix = colourMatrices[
                currentIndicators.bivariateX.dataKey
            ]
                ? colourMatrices[currentIndicators.bivariateX.dataKey]
                : colourMatrices[activePillar.label];

            const maxIndex = uniqueColourMatrix.length - 1;
            // end hack for friday

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
            let yIndex = maxIndex;

            if (currentIndicators.bivariateXEnabled) {
                xIndex = Math.floor(normX * maxIndex);
            }
            if (currentIndicators.bivariateYEnabled) {
                // input colours are from top to bottom, not bottom to top so we deduct
                yIndex = maxIndex - Math.floor(normY * maxIndex);
            }

            // hack for friday
            if (
                currentIndicators.bivariateX.dataKey ===
                "Human Development Index"
            ) {
                if (valX < 0.55) {
                    yIndex = 4;
                    xIndex = 0;
                } else if (valX < 0.7) {
                    yIndex = 4;
                    xIndex = 1;
                } else if (valX < 0.8) {
                    yIndex = 4;
                    xIndex = 2;
                } else {
                    yIndex = 4;
                    xIndex = 3;
                }

                return HDIColourMatrix[yIndex][xIndex];
            }
            // end hack for friday

            return uniqueColourMatrix[yIndex][xIndex]; // hack for friday
        };

        const strokeScale = (row) => {
            if (!row) return NULL_SHAPE_STROKE;
            const valX = getRowIndicatorValue(
                row,
                currentIndicators.bivariateX
            );
            const valY = getRowIndicatorValue(
                row,
                currentIndicators.bivariateY
            );
            if (
                currentIndicators.bivariateXEnabled &&
                currentIndicators.bivariateYEnabled
            ) {
                if (valX === null || valY === null) return NULL_SHAPE_STROKE;
            }
            if (
                currentIndicators.bivariateXEnabled &&
                !currentIndicators.bivariateYEnabled
            ) {
                if (valX === null) return NULL_SHAPE_STROKE;
            }
            if (
                !currentIndicators.bivariateXEnabled &&
                currentIndicators.bivariateYEnabled
            ) {
                if (valY === null) return NULL_SHAPE_STROKE;
            }
            return GOOD_SHAPE_STROKE;
        };

        // hack for friday
        const uniqueColourMatrixHex = colourMatricesHex[
            currentIndicators.bivariateX.dataKey
        ]
            ? colourMatricesHex[currentIndicators.bivariateX.dataKey]
            : colourMatricesHex[activePillar.label];

        return {
            radius: circleRadiusScale,
            color: bivariateColourScale,
            stroke: strokeScale,
            colorMatrix: uniqueColourMatrixHex, // hack for friday
        };
    }, [domains, currentIndicators]);
};

const Map = (props) => {
    const { countryData, covidPillar, activePillar } = props;

    const [currentIndicators, setCurrentIndicators] = React.useState({
        // Pillar indicataor is the X axis
        bivariateX: activePillar.questions[0].indicators[1],
        bivariateXEnabled: true,
        // COVID indicator is the Y axis
        bivariateY: covidPillar.questions[0].indicators[1],
        bivariateYEnabled: false,
        // Radius indicator is the circle radius
        radius: covidPillar.questions[0].indicators[0],
        radiusEnabled: true,
    });

    React.useEffect(() => {
        if (!activePillar) return;
        // Whenever active pillar changes, set the pillar indicator to the first avail.
        setCurrentIndicators((d) => ({
            ...d,
            bivariateX: activePillar.questions[0].indicators[0],
        }));
    }, [activePillar]);

    const domains = useDomains(countryData, currentIndicators);
    const scales = useScales(domains, currentIndicators, activePillar);

    return (
        <div>
            {scales && (
                <MapFiltersLegends
                    domains={domains}
                    scales={scales}
                    currentIndicators={currentIndicators}
                    setCurrentIndicators={setCurrentIndicators}
                    {...props}
                />
            )}
            <MapVis
                {...props}
                domains={domains}
                scales={scales}
                normalizedData={countryData}
                currentIndicators={currentIndicators}
            />
        </div>
    );
};

export default Map;
