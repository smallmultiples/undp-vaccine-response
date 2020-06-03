import React from "react";
import styles from "./map-filters-legends.module.scss";
import { IconArrowLeft, IconArrowRight, IconArrowUp, IconArrowDown } from "../icons/icons";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import { animated, useSpring } from "react-spring";
import useDimensions from "../../hooks/use-dimensions";
import { uniq, isNil, flatten, last } from "lodash";

const MapFiltersLegends = props => {
    const { activeQuestion } = props;
    return (
        <div className={styles.mapFiltersLegends}>
            <QuestionInfo {...props} />
            <BivariateLegend {...props} />
            <BivariateIndicatorSelection {...props} />
            <RadiusControls {...props} />
            <CategoricalLegend {...props} />
        </div>
    );
};

const QuestionInfo = props => {
    const { activeQuestion } = props;
    const [open, setOpen] = React.useState(false);
    const [descriptionRef, descriptionDimensions] = useDimensions();

    // Close when question changes.
    React.useEffect(() => {
        setOpen(false);
    }, [activeQuestion]);

    const descriptionContainerSpring = useSpring({
        height: open ? descriptionDimensions.height : 40,
    });

    return (
        <div className={styles.questionInfo}>
            <div className={styles.questionInfoHeading}>{activeQuestion.label}</div>
            <animated.div
                className={styles.questionInfoDescriptionContainer}
                style={descriptionContainerSpring}
                data-open={open}
            >
                <p className={styles.questionInfoDescription} ref={descriptionRef}>
                    {activeQuestion.description}
                </p>
            </animated.div>
            <button className={styles.questionInfoSeeMore} onClick={() => setOpen(d => !d)}>
                {open ? "view less" : "view more"}
            </button>
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
            onClick={() => onChange(!value)}
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
    const { activePillar, activeQuestion, setCurrentIndicators, currentIndicators } = props;
    const bivariateYOptions = flatten(activePillar.questions.map(d => d.indicators)).filter(
        d => !d.categorical
    );
    const bivariateXOptions = activeQuestion.indicators.filter(d => !d.categorical);

    // Disable Y axis if there is only one indicator.
    const disableY = bivariateYOptions.length === 1;

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
                        options={bivariateYOptions}
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

const categorySplit = val => val.split(";").map(d => d.trim());
const CategoricalLegend = props => {
    const { activeQuestion, normalizedData } = props;

    const categoryIndicator = React.useMemo(
        () => activeQuestion.indicators.find(d => d.categorical),
        [activeQuestion]
    );

    // TODO: module.
    const uniqueVals = React.useMemo(() => {
        if (!categoryIndicator) return null;
        return uniq(
            flatten(
                Object.values(normalizedData).map(d => {
                    const val = d[categoryIndicator.dataKey];
                    if (isNil(val)) return null;
                    return categorySplit(val);
                })
            ).filter(d => d && d.length)
        );
    }, [normalizedData, categoryIndicator]);

    if (!categoryIndicator) return null;

    // TODO: "support" is hardcoded in here.
    const items = uniqueVals.map((val, index) => {
        return (
            <tr className={styles.categoryItemRow} key={val}>
                <td className={styles.categoryItemCell}>
                    <div className={styles.categoryIcon} data-i={index} />
                    <span className={styles.categoryText}>No {val} support</span>
                </td>
                <td className={styles.categoryItemCell}>
                    <div className={styles.categoryIcon} data-i={index} data-selected />
                    <span className={styles.categoryText}>{val} support</span>
                </td>
            </tr>
        );
    });

    return (
        <table className={styles.categoryList}>
            <tbody>{items}</tbody>
        </table>
    );
};

const RadiusControls = props => {
    if (props.activeQuestion.categorical) return null;
    return (
        <div className={styles.radiusControls}>
            <RadiusIndicatorSelection {...props} />
            <RadiusLegend {...props} />
            <div className={styles.radiusIndicatorFineprint}>
                <p>*Number of confirmed cases, number of deaths, and case fatality rate</p>
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
                <span>{currentIndicators.radius.formatLegend(domain[0])}</span>
                <span>{currentIndicators.radius.formatLegend(domain[1])}</span>
            </div>
        </div>
    );
};

const Toggle = props => {
    const { options, onChange, value } = props;

    const totalLength = options.reduce((a, b) => a + b.label.length, 0);
    const widths = [27, 30, 43];

    const optionsButtons = options.map((option, i) => {
        return (
            <button
                key={option.label}
                className={styles.toggleOption}
                style={{ width: widths[i] + "%" }}
                onClick={() => onChange && onChange(option)}
                data-active={option === value}
            >
                {option.label}
            </button>
        );
    });
    const slideLeft = widths.reduce((a, b, i) => {
        if (i < options.indexOf(value)) {
            return a + b;
        }
        return a;
    }, 0);
    const optWidth = widths[options.indexOf(value)];

    const bgSlide = (
        <div
            className={styles.toggleSlide}
            style={{ width: `calc(${optWidth}% - 4px)`, left: `calc(${slideLeft}% + 2px)` }}
        />
    );
    return (
        <div className={styles.toggle}>
            {bgSlide}
            {optionsButtons}
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
                <div className={styles.bivariateAxisLabelX}>
                    {currentIndicators.bivariateX.label}
                </div>
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
