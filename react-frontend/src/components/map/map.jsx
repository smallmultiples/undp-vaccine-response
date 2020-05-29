import React from "react";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleLinear, scaleLog } from "d3-scale";
import Geostats from "geostats";
import { IconArrowLeft, IconArrowRight, IconArrowUp, IconArrowDown } from "../icons/icons";
import MapVis from "../map-vis/map-vis";

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

const Map = props => {
    const { countryData, countryDataLoading, activeIndicator } = props;
    const [bivariateEnableX, setBivariateEnableX] = React.useState(true);
    const [bivariateEnableY, setBivariateEnableY] = React.useState(true);

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
    const domains = useDomains(countryData, displaySettings);
    const scales = useScales(domains, displaySettings);
    const normalizedData = useNormalizedData(countryData, domains, displaySettings);

    return (
        <div>
            <div>
                <BivariateLegend displaySettings={displaySettings} domains={domains} />
            </div>
            <MapVis
                {...props}
                domains={domains}
                scales={scales}
                normalizedData={normalizedData}
                displaySettings={displaySettings}
            />
        </div>
    );
};

const formatNumTemp = number => (number === undefined ? "" : number.toFixed(1));
const BivariateLegend = props => {
    const { displaySettings } = props;
    const { jenks } = props.domains;
    const { variateXEnable, variateYEnable } = displaySettings;

    // TODO: format properly

    const xOnlyDisabled = !variateXEnable && variateYEnable;
    const yOnlyDisabled = !variateYEnable && variateXEnable;
    const bothDisabled = !variateXEnable && !variateYEnable;
    const eitherDisabled = !variateXEnable || !variateYEnable;

    const x0 = formatNumTemp(jenks.x[0]);
    const x1 = formatNumTemp(jenks.x[jenks.x.length - 1]);
    const y0 = formatNumTemp(jenks.y[0]);
    const y1 = formatNumTemp(jenks.y[jenks.y.length - 1]);
    return (
        <div className={styles.bivariateLegend}>
            <div className={styles.bivariateLegendTop}>
                <div className={styles.legendColourSpan} data-y>
                    <div className={styles.legendColourSpanValue} data-y>
                        <IconArrowUp />
                        <span>{displaySettings.variateYFlip ? y1 : y0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-y>
                        <span>{displaySettings.variateYFlip ? y0 : y1}</span>
                        <IconArrowDown />
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
            <div className={styles.bivariateLegendBottom}>
                <div className={styles.legendColourSpan} data-x={true}>
                    <div className={styles.legendColourSpanValue} data-x>
                        <IconArrowLeft />
                        <span>{displaySettings.variateXFlip ? x1 : x0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-x>
                        <span>{displaySettings.variateXFlip ? x0 : x1}</span>
                        <IconArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;
