import React from "react";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleSymlog, scaleLinear } from "d3-scale";
import MapVis from "../map-vis/map-vis";
import MapFiltersLegends from "../map-filters-legends/map-filters-legends";
import { flatten, isNil } from "lodash";

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
                  .filter(d => d !== undefined && d !== "")
            : [];
        const valuesY = ready
            ? Object.values(countryData)
                  .map(raw => raw[currentIndicators.bivariateY.dataKey])
                  .filter(d => d !== undefined && d !== "")
            : [];
        const valuesRadius = ready
            ? Object.values(countryData)
                  .map(raw => raw[currentIndicators.radius.dataKey])
                  .filter(d => d !== undefined && d !== "")
            : [];

        let jenksX = [],
            jenksY = [];

        if (ready) {
            const xHdi = currentIndicators.bivariateX.hdi;
            const yHdi = currentIndicators.bivariateY.hdi;

            if (xHdi) {
                jenksX = [0, 0.55, 0.7, 0.8, 1.0];
            } else {
                const extents = extent(valuesX);
                const scale = scaleLinear().range(extents).domain([0, 1]);
                jenksX = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(d => scale(d));
            }

            if (yHdi) {
                jenksY = [0, 0.55, 0.7, 0.8, 1.0];
            } else {
                const extents = extent(valuesY);
                const scale = scaleLinear().range(extents).domain([0, 1]);
                jenksY = [0, 0.2, 0.4, 0.6, 0.8, 1.0].map(d => scale(d));
            }
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
    ["#9001FE", "#A919E1", "#C130C7", "#D947AC", "#F4618D"],
    ["#7E09FF", "#8935E9", "#AB4DD5", "#CC6AC2", "#F782A5"],
    ["#6316FF", "#7547EF", "#9965E0", "#C383D1", "#F99FBA"],
    ["#3D29FF", "#5B5EF5", "#887BEB", "#B7A2E4", "#F6C5D4"],
    ["#0247FF", "#4175FC", "#7298F9", "#ACC0F7", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const greenColourMatrixHex = [
    ["#007892", "#50739E", "#7C70A5", "#AB6A9C", "#F4618D"],
    ["#11878D", "#4A889B", "#8589AB", "#B185A9", "#F782A5"],
    ["#219588", "#579B9B", "#8EA1B0", "#B8A3B7", "#F99FBA"],
    ["#32A483", "#62AD9B", "#96B7B5", "#C0C4C7", "#F6C5D4"],
    ["#43B37E", "#70C39B", "#A0D4BC", "#C7E3D6", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const yellowColourMatrixHex = [
    ["#F0B110", "#F19935", "#F2894F", "#F37967", "#F4618D"],
    ["#E9BE0F", "#ECAE3F", "#EEA35F", "#F1957C", "#F782A5"],
    ["#E1CE0E", "#E7C349", "#EBBB6E", "#EFB290", "#F99FBA"],
    ["#D9DF0D", "#E1DA54", "#E7D27D", "#ECD1A7", "#F6C5D4"],
    ["#D0F00C", "#DCF15F", "#E3F190", "#EAF2BF", "#F2F2F3"],
].map(d => (FLIP_COLOURS_HORIZONTALLY ? d.reverse() : d));

const hdiColorMatrixHex = [
    ["#EDD0C1", "#F1EBC8", "#EAEED3", "#CBE2D2"],
    ["#EBBCA5", "#F1E5AB", "#E4EBB9", "#B2D7BE"],
    ["#E7A584", "#F0DF87", "#DDE79C", "#98CDA8"],
    ["#E49066", "#F0DA69", "#D6E480", "#7FC293"],
    ["#E07038", "#EFD54D", "#D1E16A", "#60B579"],
];

const colourMatricesHex = {
    Health: blueLightColourMatrixHex,
    Protect: blueMidColourMatrixHex,
    Economic: yellowColourMatrixHex,
    Macro: greenColourMatrixHex,
    Cohesion: blueDarkMatrixHex,
};

const getRowIndicatorValue = (row, indicator) => {
    return row[indicator.dataKey];
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

const getColorMatrices = (activePillar, currentIndicators) => {
    const xHdi = currentIndicators.bivariateX.hdi && currentIndicators.bivariateXEnabled;
    const yHdi = currentIndicators.bivariateY.hdi && currentIndicators.bivariateYEnabled;

    let colorMatrixHex = colourMatricesHex[activePillar.label];

    if (xHdi || (xHdi && yHdi)) {
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

const useScales = (domains, currentIndicators, activePillar) => {
    return React.useMemo(() => {
        const circleScale = scaleSymlog().range([4, 16]).domain(domains.extents.radius);
        const circleRadiusScale = row =>
            circleScale(getRowIndicatorValue(row, currentIndicators.radius));
        circleRadiusScale.range = circleScale.range;
        circleRadiusScale.domain = circleScale.domain;

        let { colorMatrix, colorMatrixHex } = getColorMatrices(activePillar, currentIndicators);
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
            radius: circleRadiusScale,
            color: bivariateColourScale,
            stroke: strokeScale,
            colorMatrix: colorMatrixHex,
            colorX: xColourScale,
            colorY: yColourScale,
        };
    }, [domains, currentIndicators, activePillar]);
};

const getDefaultIndicatorState = (activePillar, activeQuestion, covidPillar) => {
    // TODO: module
    const bivariateYOptions = flatten(activePillar.questions.map(d => d.indicators));

    return {
        // Question indicator is the X axis
        bivariateX: activeQuestion.indicators[0],
        bivariateXEnabled: true,
        // Any indicator for the pillar on the Y axis
        bivariateY: bivariateYOptions.length > 1 ? bivariateYOptions[1] : bivariateYOptions[0],
        bivariateYEnabled: false,
        // Radius indicator is the circle radius
        radius: covidPillar.questions[0].indicators[0],
        radiusEnabled: true,
    };
};

const Map = props => {
    const { countryData, covidPillar, activePillar, activeQuestion } = props;

    const [currentIndicators, setCurrentIndicators] = React.useState(
        getDefaultIndicatorState(activePillar, activeQuestion, covidPillar)
    );

    React.useEffect(() => {
        if (!activePillar) return;
        // Whenever active pillar changes, set the pillar indicator (Y) to the first avail.
        const bivariateYOptions = flatten(activePillar.questions.map(d => d.indicators)).filter(
            d => !d.categorical
        );
        setCurrentIndicators(d => ({
            ...d,
            bivariateY: bivariateYOptions.length > 1 ? bivariateYOptions[1] : bivariateYOptions[0],
        }));
    }, [activePillar]);

    React.useEffect(() => {
        if (!activeQuestion) return;
        if (activeQuestion.categorical) {
            setCurrentIndicators(d => ({
                ...d,
                bivariateX: activeQuestion.indicators.filter(d => !d.categorical)[0],
                bivariateXEnabled: false,
            }));
        } else {
            // Whenever active QUESTION changes, set the pillar indicator to the first for the question
            setCurrentIndicators(d => ({
                ...d,
                bivariateX: activeQuestion.indicators[0],
            }));
        }
    }, [activeQuestion]);

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
                    normalizedData={countryData}
                    {...props}
                />
            )}
            <MapVis
                {...props}
                domains={domains}
                scales={scales}
                normalizedData={countryData}
                currentIndicators={currentIndicators}
                activeQuestion={activeQuestion}
            />
        </div>
    );
};

export default Map;
