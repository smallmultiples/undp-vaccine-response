import { flatten, isNil, uniq } from "lodash";
import React from "react";
import Select from "react-select";
import dropdownStyle from "../../../modules/dropdown.style";
import styles from "./map-filters-legends.module.scss";
import { categorySplit, getRowIndicatorValue } from "../../../modules/utils";
import Checkbox from "../../controls/checkbox";

// TODO: rename "normalizedData"
const MapFiltersLegends = props => {
    return (
        <div className={styles.mapFiltersLegends}>
            <BivariateIndicatorSelection {...props} />
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

const BivariateIndicatorSelection = props => {
    const { setCurrentIndicators, currentIndicators } = props;
    const hideMapVisOptions = React.useMemo(
        () => currentIndicators.mapVisualisationOptions.length === 0,
        [currentIndicators.mapVisualisationOptions]
    );


    // Disable Y axis if there is only one indicator.

    const xSources = currentIndicators.regionalX.meta?.sources
        .map((s, i) => {
            return s.name;
        })
        .join(",");
    const xLastUpdated = currentIndicators.regionalX.meta?.timePeriod
        ? " (" + currentIndicators.regionalX.meta.timePeriod + ")"
        : "";

    const ySources = currentIndicators.regionalY.meta?.sources
        .map((s, i) => {
            return s.name;
        })
        .join(",");
    const yLastUpdated = currentIndicators.regionalY.meta?.timePeriod
        ? " (" + currentIndicators.regionalY.meta.timePeriod + ")"
        : "";

    return (
        <div className={styles.bivariateIndicatorSelection} data-fullwidth={hideMapVisOptions}>
            <div className={styles.bivariateIndicatorItem} data-x>
                <Checkbox
                    value={true}
                    onChange={v =>
                        setCurrentIndicators(d => ({
                            ...d,
                            bivariateYEnabled: true,
                        }))
                    }
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <p className={styles.bivariateIndicatorDropdownLabel}>
                        Indicator X
                    </p>
                    <Select
                        options={currentIndicators.regionalAggregationOptions}
                        getOptionLabel={option =>
                            option.tableLabel ? option.tableLabel : option.label
                        }
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, regionalX: indicator }))
                        }
                        value={currentIndicators.regionalX}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={false}
                        isSearchable={true}
                    />
                </div>
                <span
                    className={styles.indicatorTooltip}
                    data-text={currentIndicators.regionalX.description}
                    data-meta={xSources + " " + xLastUpdated}
                >
                    ?
                </span>
            </div>
            <div className={styles.bivariateIndicatorItem} data-y>
                <Checkbox
                    value={true}
                    onChange={v =>
                        setCurrentIndicators(d => ({
                            ...d,
                            bivariateYEnabled: true,
                        }))
                    }
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <p className={styles.bivariateIndicatorDropdownLabel}>
                        Indicator Y
                    </p>
                    <Select
                        options={currentIndicators.regionalAggregationOptions}
                        getOptionLabel={option =>
                            option.tableLabel ? option.tableLabel : option.label
                        }
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, regionalY: indicator }))
                        }
                        value={currentIndicators.regionalY}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={false}
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
    const mapVisIndicator = props.currentIndicators.mapVisualisation;
    if (!mapVisIndicator) return null;

    return (
        <div className={styles.mapVisualisationControls}>
            <MapVisualisationIndicatorSelection {...props} />
            {mapVisIndicator.categorical || mapVisIndicator.binary ? (
                <CategoricalLegend {...props} isBinary={mapVisIndicator.binary} />
            ) : (
                <MapVisualisationRadiusLegend {...props} />
            )}
        </div>
    );
};

const MapVisualisationRadiusLegend = props => {
    const { currentIndicators, sizeRange } = props;
    if (!props.scales.mapVisualisationRadius) return null;
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
                <span>{currentIndicators.mapVisualisation.formatLegend(sizeRange[0])}</span>
                <span>{currentIndicators.mapVisualisation.formatLegend(sizeRange[1])}</span>
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
                    options={currentIndicators.regionalAggregationOptions}
                    getOptionLabel={option =>
                        option.tableLabel ? option.tableLabel : option.label
                    }
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

export default MapFiltersLegends;
