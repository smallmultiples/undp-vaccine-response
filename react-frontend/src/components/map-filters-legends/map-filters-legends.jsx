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
            <RadiusIndicatorSelection {...props} />
        </div>
    );
};

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

// TODO: component
const Checkbox = props => {
    const { value, onChange } = props;
    return (
        <button
            className={styles.checkbox}
            data-selected={value === true}
            onClick={d => onChange(!value)}
        >
            <svg
                width="11"
                height="8"
                viewBox="0 0 11 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4.37878 7.84375C4.5741 8.03906 4.90613 8.03906 5.10144 7.84375L10.8436 2.10156C11.0389 1.90625 11.0389 1.57422 10.8436 1.37891L10.1405 0.675781C9.94519 0.480469 9.63269 0.480469 9.43738 0.675781L4.74988 5.36328L2.54285 3.17578C2.34753 2.98047 2.03503 2.98047 1.83972 3.17578L1.1366 3.87891C0.941284 4.07422 0.941284 4.40625 1.1366 4.60156L4.37878 7.84375Z"
                    fill="white"
                />
            </svg>
        </button>
    );
};

const BivariateIndicatorSelection = props => {
    const { activePillar, covidPillar, setCurrentIndicators, currentIndicators } = props;
    const bivariateXOptions = flatten(activePillar.questions.map(d => d.indicators));
    const bivariateYOptions = flatten(covidPillar.questions.map(d => d.indicators));

    return (
        <div className={styles.bivariateIndicatorSelection}>
            <div className={styles.bivariateIndicatorItem} data-y>
                <Checkbox
                    value={currentIndicators.bivariateYEnabled}
                    onChange={v =>
                        setCurrentIndicators(d => ({
                            ...d,
                            bivariateYEnabled: v,
                        }))
                    }
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <Select
                        options={bivariateYOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateY: indicator }))
                        }
                        value={currentIndicators.bivariateY}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
                        isDisabled={!currentIndicators.bivariateYEnabled}
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
                    <Select
                        options={bivariateXOptions}
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

const Toggle = props => {
    const optWidth = 100 / props.options.length;
    const options = props.options.map(option => {
        return (
            <button
                key={option.label}
                className={styles.toggleOption}
                style={{ width: optWidth + "%" }}
                onClick={() => props.onChange(option)}
                data-active={option === props.value}
            >
                {option.label}
            </button>
        );
    });
    const slideLeft = props.options.indexOf(props.value) * optWidth;

    const bgSlide = (
        <div
            className={styles.toggleSlide}
            style={{ width: `calc(${optWidth}% - 4px)`, left: `calc(${slideLeft}% + 2px)` }}
        />
    );
    return (
        <div className={styles.toggle}>
            {bgSlide}
            {options}
        </div>
    );
};

const RadiusIndicatorSelection = props => {
    const { covidPillar, setCurrentIndicators, currentIndicators } = props;
    const radiusOptions = flatten(covidPillar.questions.map(d => d.indicators));
    return (
        <div className={styles.radiusIndicatorSelection}>
            <Checkbox
                value={currentIndicators.radiusEnabled}
                onChange={v =>
                    setCurrentIndicators(d => ({
                        ...d,
                        radiusEnabled: v,
                    }))
                }
            />
            <Toggle
                options={radiusOptions}
                value={currentIndicators.radius}
                onChange={v =>
                    setCurrentIndicators(d => ({
                        ...d,
                        radius: v,
                    }))
                }
            />
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
                <div className={styles.legendYLabelContainer}>
                    <div className={styles.bivariateAxisLabelY}>
                        {currentIndicators.bivariateY.label}
                    </div>
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
                <div className={styles.bivariateAxisLabelX}>
                    {currentIndicators.bivariateX.label}
                </div>
            </div>
        </div>
    );
};

export default MapFiltersLegends;
