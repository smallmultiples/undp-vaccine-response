import React from "react";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleSymlog } from "d3-scale";
import Geostats from "geostats";
import MapVis from "../map-vis/map-vis";
import MapFiltersLegends from "../map-filters-legends/map-filters-legends";
import { flatten } from "lodash";

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
                  .map(raw => raw[currentIndicators.bivariateX.dataKey])
                  .filter(d => d !== undefined)
            : [];
        const valuesY = ready
            ? Object.values(countryData)
                  .map(raw => raw[currentIndicators.bivariateY.dataKey])
                  .filter(d => d !== undefined)
            : [];
        const valuesRadius = ready
            ? Object.values(countryData)
                  .map(raw => raw[currentIndicators.radius.dataKey])
                  .filter(d => d !== undefined)
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
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}

const blueLightColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#0BC6FF", "#41D0FC", "#7FDCF9", "#BAE7F6", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const blueMidColourMatrixHex = [
    ["#002656", "#3D3664", "#794471", "#B6527F", "#F4618D"],
    ["#003665", "#3D4875", "#7B5B85", "#B96F95", "#F782A5"],
    ["#004072", "#3E5884", "#7C7096", "#BA87A8", "#F99FBA"],
    ["#005082", "#3C6D97", "#7A8BAB", "#B8A8C0", "#F6C5D4"],
    ["#006295", "#3C86AD", "#78AAC4", "#B5CEDC", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const blueDarkMatrixHex = [
    ["#161A3A", "#502C50", "#853E64", "#BD5078", "#F4618D"],
    ["#162344", "#503D5D", "#875375", "#BF6B8D", "#F782A5"],
    ["#162C4D", "#514969", "#886684", "#C1829F", "#F99FBA"],
    ["#163758", "#505B77", "#877E96", "#BFA2B5", "#F6C5D4"],
    ["#164465", "#4E6F89", "#849BAC", "#BBC7CF", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const greenColourMatrixHex = [
    ["#524916", "#7B5036", "#A35552", "#CB5B6F", "#F4618D"],
    ["#53611A", "#7C6A3E", "#A57260", "#CE7A82", "#F782A5"],
    ["#53771E", "#7D8146", "#A68B6C", "#CF9593", "#F99FBA"],
    ["#529422", "#7CA050", "#A4AD7B", "#CDB9A7", "#F6C5D4"],
    ["#51B627", "#7AC55C", "#A2D48D", "#CAE3C0", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const yellowColourMatrixHex = [
    ["#F14A02", "#F25027", "#F35549", "#F45B6B", "#F4618D"],
    ["#F46303", "#F56B2E", "#F67256", "#F77A7D", "#F782A5"],
    ["#F67904", "#F78336", "#F88C61", "#F9958D", "#F99FBA"],
    ["#F39605", "#F4A33D", "#F5AD6E", "#F6B9A1", "#F6C5D4"],
    ["#EFB906", "#F0C844", "#F1D57E", "#F2E3B8", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const HDIColourMatrixHex = [
    ["#5C61DA", "#8061C8", "#A961B3", "#D2619F", "#F4618D"],
    ["#4978E3", "#727AD4", "#9F7DC5", "#D180B3", "#F782A5"],
    ["#3690EB", "#6494DF", "#9697D3", "#C89BC6", "#F99FBA"],
    ["#21ABF5", "#57B2ED", "#88B8E5", "#BFBEDD", "#F6C5D4"],
    ["#F16821", "#F3D516", "#CBE350", "#2EB872", "#2EB872"],
];

const blueLightColourMatrix = blueLightColourMatrixHex.map(row =>
    row.map(colour => hexToRgb(colour))
);

const HDIColourMatrix = HDIColourMatrixHex.map(row => row.map(colour => hexToRgb(colour)));

const blueMidColourMatrix = blueMidColourMatrixHex.map(row => row.map(colour => hexToRgb(colour)));

const blueDarkMatrix = blueDarkMatrixHex.map(row => row.map(colour => hexToRgb(colour)));

const greenColourMatrix = greenColourMatrixHex.map(row => row.map(colour => hexToRgb(colour)));

const yellowColourMatrix = yellowColourMatrixHex.map(row => row.map(colour => hexToRgb(colour)));

const colourMatrices = {
    Health: blueLightColourMatrix,
    Protect: blueMidColourMatrix,
    "Human Development Index": HDIColourMatrix,
    Economic: yellowColourMatrix,
    Macro: greenColourMatrix,
    Cohesion: blueDarkMatrix,
};

const colourMatricesHex = {
    Health: blueLightColourMatrixHex,
    Protect: blueMidColourMatrixHex,
    "Human Development Index": HDIColourMatrixHex,
    Economic: yellowColourMatrixHex,
    Macro: greenColourMatrixHex,
    Cohesion: blueDarkMatrixHex,
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
        const circleScale = scaleSymlog().range([4, 16]).domain(domains.extents.radius);
        const circleRadiusScale = row =>
            circleScale(getRowIndicatorValue(row, currentIndicators.radius));
        circleRadiusScale.range = circleScale.range;
        circleRadiusScale.domain = circleScale.domain;

        const bivariateColourScale = row => {
            if (!row) return NULL_SHAPE_FILL;
            const valX = getRowIndicatorValue(row, currentIndicators.bivariateX);
            const valY = getRowIndicatorValue(row, currentIndicators.bivariateY);

            // Nulls based on enabled variates
            if (currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (valX === null || valY === null) return NULL_SHAPE_FILL;
            }
            if (currentIndicators.bivariateXEnabled && !currentIndicators.bivariateYEnabled) {
                if (valX === null) return NULL_SHAPE_FILL;
            }
            if (!currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (valY === null) return NULL_SHAPE_FILL;
            }

            // hack for friday
            const uniqueColourMatrix = colourMatrices[currentIndicators.bivariateX.dataKey]
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
            if (currentIndicators.bivariateX.dataKey === "Human Development Index") {
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

        const strokeScale = row => {
            if (!row) return NULL_SHAPE_STROKE;
            const valX = getRowIndicatorValue(row, currentIndicators.bivariateX);
            const valY = getRowIndicatorValue(row, currentIndicators.bivariateY);
            if (currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (valX === null || valY === null) return NULL_SHAPE_STROKE;
            }
            if (currentIndicators.bivariateXEnabled && !currentIndicators.bivariateYEnabled) {
                if (valX === null) return NULL_SHAPE_STROKE;
            }
            if (!currentIndicators.bivariateXEnabled && currentIndicators.bivariateYEnabled) {
                if (valY === null) return NULL_SHAPE_STROKE;
            }
            return GOOD_SHAPE_STROKE;
        };

        // hack for friday
        const uniqueColourMatrixHex = colourMatricesHex[currentIndicators.bivariateX.dataKey]
            ? colourMatricesHex[currentIndicators.bivariateX.dataKey]
            : colourMatricesHex[activePillar.label];

        return {
            radius: circleRadiusScale,
            color: bivariateColourScale,
            stroke: strokeScale,
            colorMatrix: uniqueColourMatrixHex, // hack for friday
        };
    }, [domains, currentIndicators, activePillar]);
};

const getDefaultIndicatorState = (activePillar, covidPillar) => {
    const bivariateOptions = flatten(activePillar.questions.map(d => d.indicators));

    return {
        // Pillar indicataor is the X axis
        bivariateX: bivariateOptions[0],
        bivariateXEnabled: true,
        // COVID indicator is the Y axis
        bivariateY: bivariateOptions.length > 1 ? bivariateOptions[1] : bivariateOptions[0],
        bivariateYEnabled: false,
        // Radius indicator is the circle radius
        radius: covidPillar.questions[0].indicators[0],
        radiusEnabled: true,
    };
};

const Map = props => {
    const { countryData, covidPillar, activePillar } = props;

    const [currentIndicators, setCurrentIndicators] = React.useState(
        getDefaultIndicatorState(activePillar, covidPillar)
    );

    React.useEffect(() => {
        if (!activePillar) return;
        // Whenever active pillar changes, set the pillar indicator to the first avail.
        const bivariateOptions = flatten(activePillar.questions.map(d => d.indicators));
        setCurrentIndicators(d => ({
            ...d,
            bivariateX: bivariateOptions[0],
            bivariateY: bivariateOptions.length > 1 ? bivariateOptions[1] : bivariateOptions[0],
            bivariateYEnabled: d.bivariateYEnabled && bivariateOptions.length > 1,
        }));
    }, [activePillar]);

    const domains = useDomains(countryData, currentIndicators);
    const scales = useScales(domains, currentIndicators, activePillar);

    return (
        <div className={styles.map}>
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
