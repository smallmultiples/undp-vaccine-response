import React from "react";
import styles from "./map-filters-legends.module.scss";
import { IconArrowLeft, IconArrowRight, IconArrowUp, IconArrowDown } from "../icons/icons";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import { flatten } from "lodash";

const MapFiltersLegends = props => {
    return (
        <div className={styles.mapFiltersLegends}>
            <BivariateLegend {...props} />
            <BivariateIndicatorSelection {...props} />
        </div>
    );
};

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

const BivariateIndicatorSelection = props => {
    const { activePillar, covidPillar, setCurrentIndicators, currentIndicators } = props;
    const bivariateXOptions = flatten(activePillar.questions.map(d => d.indicators));
    const bivariateYOptions = flatten(covidPillar.questions.map(d => d.indicators));

    return (
        <div className={styles.bivariateIndicatorSelection}>
            <div className={styles.bivariateIndicatorItem} data-x>
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <Select
                        options={bivariateXOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateX: indicator }))
                        }
                        value={currentIndicators.bivariateX}
                        style={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                    />
                </div>
            </div>
            <div className={styles.bivariateIndicatorItem} data-y>
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <Select
                        options={bivariateYOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateY: indicator }))
                        }
                        value={currentIndicators.bivariateY}
                        style={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                    />
                </div>
            </div>
        </div>
    );
};

const formatNumTemp = number => (number === undefined ? "" : number.toFixed(1));
const BivariateLegend = props => {
    const { scales, currentIndicators } = props;
    const { categories } = props.domains;
    const { bivariateXEnabled, bivariateYEnabled } = currentIndicators;
    const bivariateColourMatrixHex = scales.colorMatrix;
    // TODO: format properly

    const xOnlyDisabled = !bivariateXEnabled && bivariateYEnabled;
    const yOnlyDisabled = !bivariateYEnabled && bivariateXEnabled;
    const bothDisabled = !bivariateXEnabled && !bivariateYEnabled;
    const eitherDisabled = !bivariateXEnabled || !bivariateYEnabled;

    const x0 = formatNumTemp(categories.x[0]);
    const x1 = formatNumTemp(categories.x[categories.x.length - 1]);
    const y0 = formatNumTemp(categories.y[0]);
    const y1 = formatNumTemp(categories.y[categories.y.length - 1]);
    return (
        <div className={styles.bivariateLegend}>
            <div className={styles.bivariateLegendTop}>
                <div className={styles.legendColourSpan} data-y>
                    <div className={styles.legendColourSpanValue} data-y>
                        <IconArrowUp />
                        <span>{currentIndicators.bivariateY.flipped ? y1 : y0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-y>
                        <span>{currentIndicators.bivariateY.flipped ? y0 : y1}</span>
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
                        <span>{currentIndicators.bivariateX.flipped ? x1 : x0}</span>
                    </div>
                    <div className={styles.legendColourSpanValue} data-x>
                        <span>{currentIndicators.bivariateX.flipped ? x0 : x1}</span>
                        <IconArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapFiltersLegends;
