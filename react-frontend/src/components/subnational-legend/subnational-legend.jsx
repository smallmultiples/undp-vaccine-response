import { flatten, isNil, last, uniq } from "lodash";
import React from "react";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import isMapOnly from "../../modules/is-map-only";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp } from "../icons/icons";
import styles from "./subnational-legend.module.scss";
import { categorySplit } from "../../modules/utils";
import { HDI_COLOURS, HDI_BUCKETS } from "../../config/scales";
import Checkbox from "../controls/checkbox";

const SubnationalLegend = props => {
    return (
        <div className={styles.mapFiltersLegends}>
            <BivariateLegend {...props} />
            {/* <BivariateIndicatorSelection {...props} /> */}
            {/* <MapVisualisationControls {...props} /> */}
        </div>
    );
};

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

const BivariateIndicatorSelection = props => {
    const { setCurrentIndicators, currentIndicators } = props;
    const hideMapVisOptions = React.useMemo(
        () => currentIndicators.mapVisualisationOptions.length === 0,
        [currentIndicators.mapVisualisationOptions]
    );

    // Disable Y axis if there is only one indicator.
    const disableY = currentIndicators.bivariateOptions.length === 1;

    return (
        <div className={styles.bivariateIndicatorSelection} data-fullwidth={hideMapVisOptions}>
            <div className={styles.bivariateIndicatorItem} data-y>
                <Checkbox
                    value={currentIndicators.bivariateYEnabled}
                    onChange={v =>
                        setCurrentIndicators(d => ({
                            ...d,
                            bivariateYEnabled: v,
                        }))
                    }
                    disabled={disableY}
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <p className={styles.bivariateIndicatorDropdownLabel}>
                        {isMapOnly ? "Indicator Y" : "Other indicators in this pillar:"}
                    </p>
                    <Select
                        options={currentIndicators.bivariateOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateY: indicator }))
                        }
                        value={currentIndicators.bivariateY}
                        styles={dropdownStyle}
                        isDisabled={disableY || !currentIndicators.bivariateYEnabled}
                        isSearchable={false}
                    />
                </div>
            </div>
            <div className={styles.bivariateIndicatorItem} data-x>
                <Checkbox
                    value={currentIndicators.bivariateXEnabled}
                    onChange={v =>
                        setCurrentIndicators(d => ({
                            ...d,
                            bivariateXEnabled: v,
                        }))
                    }
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <p className={styles.bivariateIndicatorDropdownLabel}>
                        {isMapOnly ? "Indicator X" : "Other indicators in this goal:"}
                    </p>
                    <Select
                        options={currentIndicators.bivariateOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateX: indicator }))
                        }
                        value={currentIndicators.bivariateX}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={!currentIndicators.bivariateXEnabled}
                        isSearchable={false}
                    />
                </div>
            </div>
        </div>
    );
};

const CategoricalLegend = props => {
    const { normalizedData, currentIndicators } = props;

    const indicator = currentIndicators.mapVisualisation;

    // TODO: this should be in the radius extents maybe.
    const uniqueVals = React.useMemo(() => {
        if (!indicator) return null;
        return uniq(
            flatten(
                Object.values(normalizedData).map(d => {
                    const val = d[indicator.dataKey];
                    if (isNil(val)) return null;
                    return categorySplit(val);
                })
            ).filter(d => d && d.length)
        );
    }, [normalizedData, indicator]);

    if (!indicator) return null;

    const items = uniqueVals.map((val, index) => {
        const fmtString = indicator.categoryFormat || "{v}";
        const categoryString = fmtString.replace("{v}", val);
        return (
            <tr className={styles.categoryItemRow} key={val}>
                <td className={styles.categoryItemCell}>
                    <div className={styles.categoryIcon} data-i={index} data-selected />
                    <span className={styles.categoryText}>{categoryString}</span>
                </td>
            </tr>
        );
    });

    return (
        <div className={styles.categoryLegend}>
            <table
                className={styles.categoryList}
                data-visible={currentIndicators.mapVisualisationEnabled}
            >
                <tbody>
                    {items}
                    <tr className={styles.categoryItemRow}>
                        <td className={styles.categoryItemCell}>
                            <div className={styles.categoryIcon} />
                            <span className={styles.categoryText}>Not available</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const MapVisualisationControls = props => {
    const mapVisIndicator = props.currentIndicators.mapVisualisation;
    if (!mapVisIndicator) return null;

    return (
        <div className={styles.mapVisualisationControls}>
            <MapVisualisationIndicatorSelection {...props} />
            {mapVisIndicator.categorical ? (
                <CategoricalLegend {...props} />
            ) : (
                <MapVisualisationRadiusLegend {...props} />
            )}
        </div>
    );
};

const MapVisualisationRadiusLegend = props => {
    const { currentIndicators } = props;
    if (!props.scales.mapVisualisationRadius) return null;
    const domain = props.scales.mapVisualisationRadius.domain();
    const range = props.scales.mapVisualisationRadius.range();

    const stroke = 2;
    const hs = stroke / 2;
    const width = 105;
    const height = 40;
    const ar = range[0];
    const ax = ar + hs;

    const MAX_RADIUS = 18;

    const br = Math.min(MAX_RADIUS, range[1]);
    const bx = width - br - hs;

    const cy = height / 2;

    const aTop = cy - ar;
    const aBot = cy + ar;
    const bTop = cy - br;
    const bBot = cy + br;

    const polyPoints = [
        [ax, aTop],
        [bx, bTop],
        [bx, bBot],
        [ax, aBot],
    ]
        .map(d => d.join(","))
        .join(" ");

    return (
        <div className={styles.mapVisualisationLegend}>
            <svg className={styles.legendSvg}>
                <polygon className={styles.legendPoly} points={polyPoints} />
                <circle className={styles.legendCircle} cx={ax} r={ar} cy={cy} />
                <circle className={styles.legendCircle} cx={bx} r={br} cy={cy} />
            </svg>
            <div className={styles.legendLabels}>
                <span>{currentIndicators.mapVisualisation.formatLegend(domain[0])}</span>
                <span>{currentIndicators.mapVisualisation.formatLegend(domain[1])}</span>
            </div>
            {/* <div className={styles.mapVisualisationIndicatorFineprint}>
                <p>*Number of confirmed cases, number of deaths, and case fatality rate</p>
            </div> */}
        </div>
    );
};

const MapVisualisationIndicatorSelection = props => {
    const { setCurrentIndicators, currentIndicators } = props;

    return (
        <div className={styles.mapVisualisationIndicatorSelection}>
            <Checkbox
                value={currentIndicators.mapVisualisationEnabled}
                onChange={v =>
                    setCurrentIndicators(d => ({
                        ...d,
                        mapVisualisationEnabled: v,
                    }))
                }
            />
            <div className={styles.mapVisualisationIndicatorDropdownWrap}>
                <Select
                    options={currentIndicators.mapVisualisationOptions}
                    onChange={indicator =>
                        setCurrentIndicators(d => ({ ...d, mapVisualisation: indicator }))
                    }
                    value={currentIndicators.mapVisualisation}
                    styles={dropdownStyle}
                    isSearchable={false}
                    noGap
                />
            </div>
        </div>
    );
};

const BivariateLegend = props => {
    const { currentIndicators } = props;

    const x0 = "Less";
    const x1 = "More";
    const y0 = "Less";
    const y1 = "More";

    return (
        <div className={styles.bivariateLegend}>
            <div className={styles.bivariateLegendTop}>
                <BivariateLegendGrid {...props} />
            </div>
            <div className={styles.bivariateLegendBottom} data-visible={true}>
                <div className={styles.legendColourSpan} data-x={true}>
                    <div className={styles.legendColourSpanValue} data-x>
                        <IconArrowLeft />
                        <span>{x0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-x>
                        <span>{x1}</span>
                        <IconArrowRight />
                    </div>
                </div>
                <div className={styles.bivariateAxisLabelX}>HDI</div>
            </div>
        </div>
    );
};

const BivariateLegendGrid = props => {
    const [hovered, setHovered] = React.useState(null);

    const cols = HDI_COLOURS.map((hex, colIndex) => {
        const showTooltip = hovered === colIndex;

        let tooltip = null;

        if (showTooltip) {
            const xMin = HDI_BUCKETS[colIndex];
            const xMax = HDI_BUCKETS[colIndex + 1];

            tooltip = (
                <div className={styles.legendColourTooltip}>
                    <div className={styles.legendColourTooltipEntry}>
                        <div
                            className={styles.legendColourTooltipIcon}
                            style={{
                                background: HDI_COLOURS[colIndex],
                            }}
                        />
                        <div className={styles.legendColourTooltipText}>
                            <div className={styles.legendColourTooltipLabel}>HDI</div>
                            <div className={styles.legendColourTooltipValue}>
                                Between {xMin} and {xMax}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={colIndex}
                className={styles.legendColourCell}
                data-hdi-x
                style={{ background: hex }}
                data-hovered={showTooltip}
                onMouseEnter={() => setHovered(colIndex)}
                onMouseLeave={() => setHovered(null)}
            >
                {tooltip}
            </div>
        );
    });

    return (
        <div className={styles.legendColour}>
            <div className={styles.legendColourRow}>{cols}</div>
        </div>
    );
};

export default SubnationalLegend;
