import { flatten, isNil, last, uniq } from "lodash";
import React from "react";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import isMapOnly from "../../modules/is-map-only";
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp } from "../icons/icons";
import styles from "./map-filters-legends.module.scss";
import { categorySplit, getRowIndicatorValue } from "../../modules/utils";
import Checkbox from "../controls/checkbox";

// TODO: rename "normalizedData"
const MapFiltersLegends = props => {
    return (
        <div className={styles.mapFiltersLegends}>
            <BivariateIndicatorSelection {...props} />
            <BivariateLegend {...props} />
            <MapVisualisationControls {...props} />
        </div>
    );
};

export const MapFiltersLegendMobile = props => {
    // TODO: redo this.
    return <MapFiltersLegends {...props} />;
};

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

const truncate = (str, n, useWordBoundary) => {
    if (str.length <= n) {
        return str;
    }
    const subString = str.substr(0, n - 1); // the original check
    return (
        (useWordBoundary ? subString.substr(0, subString.lastIndexOf(" ")) : subString) + "&hellip;"
    );
};

const BivariateIndicatorSelection = props => {
    const { setCurrentIndicators, currentIndicators } = props;
    const hideMapVisOptions = React.useMemo(
        () => currentIndicators.mapVisualisationOptions.length === 0,
        [currentIndicators.mapVisualisationOptions]
    );

    // Disable Y axis if there is only one indicator.
    const disableY = currentIndicators.bivariateOptions.length === 1;

    const xIsComposite = React.useMemo(() => currentIndicators.bivariateX.isComposite, [
        currentIndicators.bivariateX,
    ]);
    const yIsComposite = React.useMemo(() => currentIndicators.bivariateY.isComposite, [
        currentIndicators.bivariateY,
    ]);

    const xOptions = React.useMemo(() => {
        if (yIsComposite) return currentIndicators.bivariateOptions.filter(d => !d.isComposite);
        return currentIndicators.bivariateOptions;
    }, [currentIndicators, yIsComposite]);

    const yOptions = React.useMemo(() => {
        if (xIsComposite) return currentIndicators.bivariateOptions.filter(d => !d.isComposite);
        return currentIndicators.bivariateOptions;
    }, [currentIndicators, xIsComposite]);

    const xSources = currentIndicators.bivariateX.meta?.sources
        .map((s, i) => {
            return s.name;
        })
        .join(",");
    const xLastUpdated = currentIndicators.bivariateX.meta?.timePeriod
        ? " (" + currentIndicators.bivariateX.meta.timePeriod + ")"
        : "";

    const ySources = currentIndicators.bivariateY.meta?.sources
        .map((s, i) => {
            return s.name;
        })
        .join(",");
    const yLastUpdated = currentIndicators.bivariateY.meta?.timePeriod
        ? " (" + currentIndicators.bivariateY.meta.timePeriod + ")"
        : "";

    return (
        <div className={styles.bivariateIndicatorSelection} data-fullwidth={hideMapVisOptions}>
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
                        {isMapOnly ? "Indicator X" : "Choose an indicator to color regions"}
                    </p>
                    <Select
                        options={xOptions}
                        getOptionLabel={option =>
                            option.tableLabel ? option.tableLabel : option.label
                        }
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateX: indicator }))
                        }
                        value={currentIndicators.bivariateX}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={!currentIndicators.bivariateXEnabled}
                        isSearchable={true}
                    />
                </div>
                <span
                    className={styles.indicatorTooltip}
                    data-text={currentIndicators.bivariateX.description}
                    data-meta={xSources + " " + xLastUpdated}
                >
                    ?
                </span>
            </div>
            {currentIndicators.bivariateX.aggregations.length > 1 && (
                <div className={styles.aggregationSelect}>
                    {currentIndicators.bivariateX.aggregations.map(agg => (
                        <button
                            data-selected={
                                agg.key === currentIndicators.bivariateX.currentAggregation.key
                            }
                            onClick={() => {
                                setCurrentIndicators(c => ({
                                    ...c,
                                    bivariateX: {
                                        ...c.bivariateX,
                                        currentAggregation: agg,
                                    },
                                }));
                            }}
                        >
                            {agg.label}
                        </button>
                    ))}
                </div>
            )}
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
                        {isMapOnly ? "Indicator Y" : "Choose a secondary indicator"}
                    </p>
                    <Select
                        options={yOptions}
                        getOptionLabel={option =>
                            option.tableLabel ? option.tableLabel : option.label
                        }
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateY: indicator }))
                        }
                        value={currentIndicators.bivariateY}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={disableY || !currentIndicators.bivariateYEnabled}
                        isSearchable={true}
                    />
                </div>
                <span
                    className={styles.indicatorTooltip}
                    data-text={currentIndicators.bivariateY.description}
                    data-meta={ySources + " " + yLastUpdated}
                >
                    ?
                </span>
            </div>
            {currentIndicators.bivariateY.aggregations.length > 1 && (
                <div className={styles.aggregationSelect}>
                    {currentIndicators.bivariateY.aggregations.map(agg => (
                        <button
                            data-selected={
                                agg.key === currentIndicators.bivariateY.currentAggregation.key
                            }
                            onClick={() => {
                                setCurrentIndicators(c => ({
                                    ...c,
                                    bivariateY: {
                                        ...c.bivariateY,
                                        currentAggregation: agg,
                                    },
                                }));
                            }}
                        >
                            {agg.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CategoricalLegend = props => {
    const { normalizedData, currentIndicators, isBinary } = props;

    const indicator = currentIndicators.mapVisualisation;

    // TODO: this should be in the radius extents maybe.
    const uniqueVals = React.useMemo(() => {
        if (!indicator) return null;
        return uniq(
            flatten(
                Object.values(normalizedData).map(d => {
                    const val = getRowIndicatorValue(d, indicator);
                    if (isNil(val)) return null;
                    return isBinary ? val === true ? 'Yes' : 'No' : categorySplit(val);
                })
            ).filter(d => d && d.length)
        );
    }, [normalizedData, indicator, isBinary]);

    if (!indicator) return null;

    const items = (isBinary ? ["Yes", "No"] : uniqueVals.sort()).map((val, index) => {
        const fmtString = indicator.categoryFormat || "{v}";
        const categoryString = fmtString.replace("{v}", val);
        return (
            <li className={styles.categoryItemRow} key={val}>
                <div
                    className={styles.categoryIcon}
                    data-i={index}
                    data-selected
                    data-gradient={indicator.isGradient}
                    data-binary={isBinary}
                />
                <span className={styles.categoryText}>{categoryString}</span>
            </li>
        );
    });

    return (
        <div className={styles.categoryLegend}>
            <ul
                className={styles.categoryList}
                data-visible={currentIndicators.mapVisualisationEnabled}
            >
                {items}
                {!isBinary && (
                    <li className={styles.categoryItemRow}>
                        <div className={styles.categoryIcon} />
                        <span className={styles.categoryText}>No data available</span>
                    </li>
                )}
            </ul>
        </div>
    );
};

const MapVisualisationControls = props => {
    const { setCurrentIndicators } = props;
    const mapVisIndicator = props.currentIndicators.mapVisualisation;
    if (!mapVisIndicator) return null;

    return (
        <div className={styles.mapVisualisationControls}>
            <MapVisualisationIndicatorSelection {...props} />
            <div className={styles.aggregationSelectWrapper}>
                {mapVisIndicator.aggregations.length > 1 && (
                    <div className={styles.aggregationSelect}>
                        {mapVisIndicator.aggregations.map(agg => (
                            <button
                                data-selected={agg.key === mapVisIndicator.currentAggregation.key}
                                onClick={() => {
                                    setCurrentIndicators(c => ({
                                        ...c,
                                        mapVisualisation: {
                                            ...mapVisIndicator,
                                            currentAggregation: agg,
                                        },
                                    }));
                                }}
                            >
                                {agg.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {mapVisIndicator.categorical || mapVisIndicator.binary ? (
                <CategoricalLegend {...props} isBinary={mapVisIndicator.binary} />
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

    const mapVisualisationSources = currentIndicators.mapVisualisation.meta?.sources
        .map((s, i) => {
            return s.name;
        })
        .join(",");

    const mapVisualisationLastUpdated = currentIndicators.mapVisualisation.meta?.timePeriod
        ? " (" + currentIndicators.mapVisualisation.meta.timePeriod + ")"
        : "";

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
                <p className={styles.mapVisualisationControlsLabel}>
                    Choose an indicator to overlay
                </p>
                <Select
                    options={currentIndicators.mapVisualisationOptions}
                    onChange={indicator =>
                        setCurrentIndicators(d => ({ ...d, mapVisualisation: indicator }))
                    }
                    value={currentIndicators.mapVisualisation}
                    styles={dropdownStyle}
                    isOptionSelected={isOptionSelected}
                    isSearchable={true}
                    noGap
                />
            </div>
            <span
                className={styles.indicatorTooltip}
                data-text={currentIndicators.mapVisualisation.description}
                data-meta={mapVisualisationSources + " " + mapVisualisationLastUpdated}
            >
                ?
            </span>
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
                <div
                    className={styles.legendYLabelContainer}
                    data-visible={currentIndicators.bivariateYEnabled}
                >
                    <div
                        className={styles.bivariateAxisLabelY}
                        title={currentIndicators.bivariateY.label}
                        dangerouslySetInnerHTML={{
                            __html: truncate(
                                currentIndicators.bivariateY.tableLabel
                                    ? currentIndicators.bivariateY.tableLabel
                                    : currentIndicators.bivariateY.label,
                                40,
                                true
                            ),
                        }}
                    />
                    <div className={styles.legendColourSpan} data-y>
                        <div className={styles.legendColourSpanValue} data-y>
                            <IconArrowUp />
                            <span>{currentIndicators.bivariateY.flipped ? y0 : y1}</span>
                        </div>
                        <div className={styles.legendColourSpanValue} data-y>
                            <span>{currentIndicators.bivariateY.flipped ? y1 : y0}</span>
                            <IconArrowDown />
                        </div>
                    </div>
                </div>
                <BivariateLegendGrid {...props} />
            </div>
            <div
                className={styles.bivariateLegendBottom}
                data-visible={currentIndicators.bivariateXEnabled}
            >
                <div className={styles.legendColourSpan} data-x={true}>
                    <div className={styles.legendColourSpanValue} data-x>
                        <IconArrowLeft />
                        <span>{currentIndicators.bivariateX.flipped ? x1 : x0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-x>
                        <span>{currentIndicators.bivariateX.flipped ? x0 : x1}</span>
                        <IconArrowRight />
                    </div>
                </div>
                <div
                    className={styles.bivariateAxisLabelX}
                    title={currentIndicators.bivariateX.label}
                    dangerouslySetInnerHTML={{
                        __html: truncate(
                            currentIndicators.bivariateX.tableLabel
                                ? currentIndicators.bivariateX.tableLabel
                                : currentIndicators.bivariateX.label,
                            40,
                            true
                        ),
                    }}
                />
            </div>
        </div>
    );
};

const BivariateLegendGrid = props => {
    const { domains, scales, currentIndicators } = props;
    const { bivariateXEnabled, bivariateYEnabled } = currentIndicators;
    const bivariateColourMatrixHex = scales.colorMatrix;
    const [hovered, setHovered] = React.useState(null);

    const xDisabled = !bivariateXEnabled;
    const yDisabled = !bivariateYEnabled;

    // TODO: need to module this
    const xHdi = currentIndicators.bivariateX.hdi && currentIndicators.bivariateXEnabled;
    const yHdi = !xHdi && currentIndicators.bivariateY.hdi && currentIndicators.bivariateYEnabled;

    const rows = bivariateColourMatrixHex.map((colHexes, rowIndex) => {
        const cols = colHexes.map((hex, colIndex) => {
            let disabled = false;

            // Only bot left if both disabled
            if (xDisabled && yDisabled) {
                if (rowIndex > 0 || colIndex > 0) disabled = true;
            }

            if (xDisabled) {
                if (colIndex > 0) disabled = true;
            }

            if (yDisabled) {
                if (rowIndex < bivariateColourMatrixHex.length - 1) disabled = true;
            }

            const showTooltip = hovered && hovered[0] === colIndex && hovered[1] === rowIndex;

            let tooltip = null;

            if (showTooltip) {
                const xIndexMax = domains.categories.x.length - 1;
                const yIndexMax = domains.categories.y.length - 1;

                const xMin = currentIndicators.bivariateX.flipped
                    ? domains.categories.x[xIndexMax - colIndex]
                    : domains.categories.x[colIndex];
                const xMax = currentIndicators.bivariateX.flipped
                    ? domains.categories.x[xIndexMax - (colIndex + 1)]
                    : domains.categories.x[colIndex + 1];
                const yMin = currentIndicators.bivariateY.flipped
                    ? domains.categories.y[rowIndex + 1]
                    : domains.categories.y[yIndexMax - (rowIndex + 1)];
                const yMax = currentIndicators.bivariateY.flipped
                    ? domains.categories.y[rowIndex]
                    : domains.categories.y[yIndexMax - rowIndex];

                // If both axes are HDI then we hide the y tooltip because it is borked.
                const hideY = currentIndicators.bivariateY.hdi && currentIndicators.bivariateX.hdi;

                tooltip = (
                    <div className={styles.legendColourTooltip}>
                        {bivariateYEnabled && !hideY && (
                            <div className={styles.legendColourTooltipEntry}>
                                <div
                                    className={styles.legendColourTooltipIcon}
                                    style={{
                                        background: bivariateColourMatrixHex[rowIndex][0],
                                    }}
                                />
                                <div className={styles.legendColourTooltipText}>
                                    <div className={styles.legendColourTooltipLabel}>
                                        {currentIndicators.bivariateY.label}
                                    </div>
                                    <div className={styles.legendColourTooltipValue}>
                                        Between {currentIndicators.bivariateY.formatLegend(yMin)}{" "}
                                        and {currentIndicators.bivariateY.formatLegend(yMax)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {bivariateXEnabled && (
                            <div className={styles.legendColourTooltipEntry}>
                                <div
                                    className={styles.legendColourTooltipIcon}
                                    style={{
                                        background: last(bivariateColourMatrixHex)[colIndex],
                                    }}
                                />
                                <div className={styles.legendColourTooltipText}>
                                    <div className={styles.legendColourTooltipLabel}>
                                        {currentIndicators.bivariateX.label}
                                    </div>
                                    <div className={styles.legendColourTooltipValue}>
                                        Between {currentIndicators.bivariateX.formatLegend(xMin)}{" "}
                                        and {currentIndicators.bivariateX.formatLegend(xMax)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div
                    key={colIndex}
                    className={styles.legendColourCell}
                    style={{ background: hex }}
                    data-disabled={disabled}
                    data-hdi-x={xHdi}
                    data-hdi-y={yHdi}
                    data-hovered={showTooltip}
                    onMouseEnter={() => !disabled && setHovered([colIndex, rowIndex])}
                    onMouseLeave={() => setHovered(null)}
                >
                    {tooltip}
                </div>
            );
        });
        return (
            <div key={rowIndex} className={styles.legendColourRow}>
                {cols}
            </div>
        );
    });

    return <div className={styles.legendColour}>{rows}</div>;
};

export default MapFiltersLegends;
