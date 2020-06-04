import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { range, max } from "d3-array";
import styles from "./chart.module.scss";
import useDimensions from "../../hooks/use-dimensions";
import useMediaQuery from "../../hooks/use-media-query";

const padding = {
    top: 10,
    bottom: 10,
    left: 30,
    right: 0,
};

const useDomains = (data, isOnlyPositive) => {
    const x = range(0, data.length);
    const maxVal = max(data, d => Math.abs(d));
    return {
        x,
        y: isOnlyPositive ? [0, maxVal] : [-maxVal, maxVal],
    };
};

const useScales = (dimensions, domains) => {
    if (!dimensions) return undefined;

    const frame = {
        top: padding.top,
        right: dimensions.width - padding.right,
        bottom: dimensions.height - padding.bottom,
        left: padding.left,
        width: dimensions.width - padding.right - padding.left,
        height: dimensions.height - padding.top - padding.bottom,
    };

    const x = scaleBand().domain(domains.x).range([frame.left, frame.right]).paddingInner(0.5);

    const y = scaleLinear().domain(domains.y).rangeRound([frame.bottom, frame.top]).nice();
    return {
        frame,
        x,
        y,
    };
};

const Chart = props => {
    const { indicator, data } = props;
    const [ref, dimensions] = useDimensions();
    const indicatorData = data.map(x => x.data);
    const isOnlyPositive = indicatorData.every(x => x >= 0);
    const domains = useDomains(indicatorData, isOnlyPositive);
    const scales = useScales(dimensions, domains);

    const [hoveredData, setHoveredData] = React.useState(undefined);

    const chartProps = {
        data: indicatorData,
        rawData: data,
        isOnlyPositive,
        dimensions,
        domains,
        scales,
        indicator,
    };

    const chartContent = scales && data.length !== 0 && (
        <Data {...chartProps} hoveredData={hoveredData} setHoveredData={setHoveredData} />
    );

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.title}>{indicator.tableLabel || indicator.label}</div>
                <p className={styles.info}>{indicator.description}</p>
            </div>
            <svg className={styles.svg} ref={ref} onMouseLeave={() => setHoveredData(null)}>
                {chartContent}
            </svg>
        </div>
    );
};

const Data = props => {
    const { scales, data, rawData, isOnlyPositive, hoveredData, setHoveredData, indicator } = props;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const absMaxVal = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const midVal = absMaxVal / 2;
    const { isMobile } = useMediaQuery();

    const rects = rawData
        .sort((j, k) => j.data - k.data)
        .map((d, i) => {
            const left = scales.x(i);
            const width = scales.x.bandwidth();
            const top = d.data >= 0 ? scales.y(d.data) : scales.y(0);
            const height = Math.abs(scales.y(0) - scales.y(d.data));
            const isHovered = hoveredData && hoveredData.item.country === d.country;
            return (
                <g key={i}>
                    <rect
                        className={styles.bar}
                        x={isHovered ? left - 1 : left}
                        width={isHovered ? width + 2 : width}
                        y={top}
                        height={height}
                        data-low={d.hdi < 0.55}
                        data-medium={d.hdi >= 0.55 && d.hdi < 0.7}
                        data-high={d.hdi >= 0.7 && d.hdi < 0.8}
                        data-very-high={d.hdi >= 0.8}
                        data-hovered={isHovered}
                    />
                    <rect
                        className={styles.hoverableBar}
                        x={left}
                        width={width}
                        y={0}
                        height={150}
                        onMouseEnter={e =>
                            !isMobile &&
                            setHoveredData({ item: d, left, top, isWithNegativeData: minVal < 0 })
                        }
                    />
                </g>
            );
        });
    return (
        <g>
            <g>
                <rect
                    className={styles.thinLine}
                    x={padding.left}
                    width={scales.frame.width}
                    y={scales.y(midVal)}
                    height={1}
                />
                <text className={styles.tick} x={0} y={scales.y(midVal) + 5}>
                    {indicator.format(midVal)}
                </text>
                <rect
                    className={styles.thinLine}
                    x={padding.left}
                    width={scales.frame.width}
                    y={scales.y(absMaxVal)}
                    height={1}
                />
                <text className={styles.tick} x={0} y={scales.y(absMaxVal) + 5}>
                    {indicator.format(absMaxVal)}
                </text>
                {!isOnlyPositive && (
                    <>
                        <rect
                            className={styles.thinLine}
                            x={padding.left}
                            width={scales.frame.width}
                            y={scales.y(-midVal)}
                            height={1}
                        />
                        <text className={styles.tick} x={0} y={scales.y(-midVal) + 5}>
                            {indicator.format(-midVal)}
                        </text>
                        <rect
                            className={styles.thinLine}
                            x={padding.left}
                            width={scales.frame.width}
                            y={scales.y(-absMaxVal)}
                            height={1}
                        />
                        <text className={styles.tick} x={0} y={scales.y(-absMaxVal) + 5}>
                            {indicator.format(-absMaxVal)}
                        </text>
                    </>
                )}
            </g>
            <g>{rects}</g>
            <g>
                <rect
                    className={styles.line}
                    x={padding.left}
                    width={scales.frame.width}
                    y={scales.y(0) - 2}
                    height={2}
                />
                <text className={styles.tick} x={0} y={scales.y(0) + 5}>
                    0
                </text>
            </g>
            {!isMobile && hoveredData && (
                <CountryData hoveredData={hoveredData} frame={scales.frame} indicator={indicator} />
            )}
        </g>
    );
};

const CountryData = props => {
    const { hoveredData, frame, indicator } = props;
    const framePadding = 12;
    const boxWidth = 150;
    const boxHeight = 48;
    let x = hoveredData.left + framePadding;
    x = x + boxWidth > frame.width - framePadding ? frame.width - boxWidth - framePadding : x;
    x = x < frame.left + framePadding ? frame.left + framePadding : x;

    let y = hoveredData.top - boxHeight - framePadding;
    y = y < frame.top + framePadding ? frame.top + framePadding : y;
    y =
        hoveredData.isWithNegativeData && hoveredData.item.data > 0
            ? frame.bottom - boxHeight - framePadding
            : y;
    return (
        <>
            <rect x={x} y={y} className={styles.tooltip} />
            <foreignObject x={x} y={y} width={boxWidth} height={boxHeight}>
                <div className={styles.tooltipTextWrapper}>
                    <div className={styles.tooltipText}>{hoveredData.item.country}</div>
                    <div className={styles.tooltipData}>
                        {indicator.format(hoveredData.item.data)}
                    </div>
                </div>
            </foreignObject>
        </>
    );
};

export default Chart;
