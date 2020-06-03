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
            <div className={styles.radiusControls}>
                <RadiusLegend {...props} />
                <RadiusIndicatorSelection {...props} />
            </div>
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
    const { value, onChange, disabled } = props;
    return (
        <button
            className={styles.checkbox}
            data-selected={value === true}
            onClick={d => onChange(!value)}
            disabled={disabled}
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
    const { activePillar, setCurrentIndicators, currentIndicators } = props;
    const bivariateOptions = flatten(activePillar.questions.map(d => d.indicators)).filter(
        d => !d.categorical
    );

    // Disable Y axis if there is only one indicator.
    const disableY = bivariateOptions.length === 1;

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
                    disabled={disableY}
                />
                <div className={styles.bivariateIndicatorDropdownWrap}>
                    <Select
                        options={bivariateOptions}
                        onChange={indicator =>
                            setCurrentIndicators(d => ({ ...d, bivariateY: indicator }))
                        }
                        value={currentIndicators.bivariateY}
                        styles={dropdownStyle}
                        isOptionSelected={isOptionSelected}
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
                    <Select
                        options={bivariateOptions}
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

const RadiusLegend = props => {
    const { currentIndicators } = props;
    if (!props.scales.radius) return null;
    const domain = props.scales.radius.domain();
    const range = props.scales.radius.range();

    const stroke = 2;
    const hs = stroke / 2;
    const width = 105;
    const height = 40;
    const ar = range[0];
    const ax = ar + hs;

    const br = range[1];
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
        <div className={styles.radiusLegend}>
            <svg className={styles.legendSvg}>
                <polygon className={styles.legendPoly} points={polyPoints} />
                <circle className={styles.legendCircle} cx={ax} r={ar} cy={cy} />
                <circle className={styles.legendCircle} cx={bx} r={br} cy={cy} />
            </svg>
            <div className={styles.legendLabels}>
                <span>{currentIndicators.radius.format(domain[0])}</span>
                <span>{currentIndicators.radius.format(domain[1])}</span>
            </div>
        </div>
    );
};

const Toggle = props => {
    const totalLength = props.options.reduce((a, b) => a + b.label.length, 0);

    const options = props.options.map(option => {
        return (
            <button
                key={option.label}
                className={styles.toggleOption}
                style={{ width: (option.label.length / totalLength) * 100 + "%" }}
                onClick={() => props.onChange(option)}
                data-active={option === props.value}
            >
                {option.label}
            </button>
        );
    });
    // TODO: someone needs to fix this gross code sorry
    const optWidth =
        (props.options[props.options.indexOf(props.value)].label.length / totalLength) * 100;
    let slideLeft = props.options.reduce((a, b, i) => {
        if (i < props.options.indexOf(props.value)) {
            return a + b.label.length;
        }
        return a;
    }, 0);
    slideLeft = (slideLeft / totalLength) * 100;

    const bgSlide = (
        <div
            className={styles.toggleSlide}
            style={{ width: `calc(${optWidth}% - 2px)`, left: `calc(${slideLeft}% + 1px)` }}
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

const BivariateLegend = props => {
    const { currentIndicators } = props;
    const { categories } = props.domains;

    const formatX = currentIndicators.bivariateX.format;
    const formatY = currentIndicators.bivariateY.format;

    const x0 = formatX(categories.x[0]);
    const x1 = formatX(categories.x[categories.x.length - 1]);
    const y0 = formatY(categories.y[0]);
    const y1 = formatY(categories.y[categories.y.length - 1]);

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

const BivariateLegendGrid = props => {
    const { scales, currentIndicators } = props;
    const { bivariateXEnabled, bivariateYEnabled } = currentIndicators;
    const bivariateColourMatrixHex = scales.colorMatrix;

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

            return (
                <div
                    key={colIndex}
                    className={styles.legendColourCell}
                    style={{ background: hex }}
                    data-disabled={disabled}
                    data-hdi-x={xHdi}
                    data-hdi-y={yHdi}
                />
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
