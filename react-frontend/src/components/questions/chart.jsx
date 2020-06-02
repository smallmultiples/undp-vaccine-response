import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { range, max, extent } from "d3-array";
import styles from "./chart.module.scss";
import useDimensions from "../../hooks/use-dimensions";

const padding = {
    top: 0,
    bottom: 0,
    left: 0,
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
    };

    const ticks = scales && data.length !== 0 && <Ticks {...chartProps} />;
    const chartContent = scales && data.length !== 0 && (
        <Data {...chartProps} hoveredData={hoveredData} setHoveredData={setHoveredData} />
    );

    return (
        <div className={styles.container}>
            <div className={styles.title}>{indicator}</div>
            {ticks}
            <svg className={styles.svg} ref={ref}>
                {chartContent}
            </svg>
        </div>
    );
};

const Data = props => {
    const { scales, data, rawData, isOnlyPositive, hoveredData, setHoveredData } = props;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const absMaxVal = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const midVal = absMaxVal / 2;

    const rects = rawData
        .sort((j, k) => j.data - k.data)
        .map((d, i) => {
            const left = scales.x(i);
            const width = scales.x.bandwidth();
            const top = d.data >= 0 ? scales.y(d.data) : scales.y(0);
            const height = Math.abs(scales.y(0) - scales.y(d.data));
            const isHovered = hoveredData && hoveredData.country === d.country;
            return (
                <g key={i}>
                    <rect
                        className={styles.bar}
                        x={isHovered ? left - 1 : left}
                        width={isHovered ? width + 2 : width}
                        y={isHovered ? top - 5 : top}
                        height={isHovered ? height + 5 : height}
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
                        onMouseEnter={e => setHoveredData({ country: d, left, top })}
                    />
                </g>
            );
        });
    return (
        <g>
            <g>
                <rect
                    className={styles.thinLine}
                    x={0}
                    width={scales.frame.width}
                    y={scales.y(midVal)}
                    height={1}
                />
                <rect
                    className={styles.thinLine}
                    x={0}
                    width={scales.frame.width}
                    y={scales.y(absMaxVal)}
                    height={1}
                />
                {!isOnlyPositive && (
                    <>
                        <rect
                            className={styles.thinLine}
                            x={0}
                            width={scales.frame.width}
                            y={scales.y(-midVal)}
                            height={1}
                        />
                        <rect
                            className={styles.thinLine}
                            x={0}
                            width={scales.frame.width}
                            y={scales.y(-absMaxVal)}
                            height={1}
                        />
                    </>
                )}
            </g>
            <g>{rects}</g>
            <g>
                <rect
                    className={styles.line}
                    x={0}
                    width={scales.frame.width}
                    y={scales.y(0) - 2}
                    height={2}
                />
            </g>
            {hoveredData && (
                        <>
                            <rect x={hoveredData.left - 40} y={40} className={styles.tooltip} />
                            <foreignObject x={hoveredData.left - 40} y={40} width={150} height={48}>
                                <div className={styles.tooltipTextWrapper}>
                                    <div className={styles.tooltipText}>{hoveredData.country.country}</div>
                                    <div className={styles.tooltipData}>{hoveredData.country.data}</div>
                                </div>
                            </foreignObject>
                        </>
                    )}
        </g>
    );
};

const Ticks = props => {
    const { scales, data, isOnlyPositive } = props;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const absMaxVal = Math.max(Math.abs(minVal), Math.abs(maxVal));
    const midVal = absMaxVal / 2;
    return (
        <div className={styles.ticks}>
            <div
                className={styles.tick}
                style={{
                    top: scales.y(absMaxVal) - 8,
                }}
            >
                {formatLabel(absMaxVal)}
            </div>
            <div
                className={styles.tick}
                style={{
                    top: scales.y(midVal) - 8,
                }}
            >
                {formatLabel(midVal)}
            </div>
            <div
                className={styles.tick}
                style={{
                    top: scales.y(0) - 8,
                }}
            >
                0
            </div>
            {!isOnlyPositive && (
                <>
                    <div
                        className={styles.tick}
                        style={{
                            top: scales.y(-midVal) - 8,
                        }}
                    >
                        {formatLabel(-midVal)}
                    </div>
                    <div
                        className={styles.tick}
                        style={{
                            top: scales.y(-absMaxVal) - 8,
                        }}
                    >
                        {formatLabel(-absMaxVal)}
                    </div>
                </>
            )}
        </div>
    );
};

const formatLabel = number => {
    if (!number) {
        return;
    }
    const abs = Math.abs(number);
    const sign = number >= 0 ? "" : "-";
    let formattedNumber;
    if (abs <= 1) {
        formattedNumber = Math.round(abs * 10) / 10;
    } else if (abs < 1000) {
        formattedNumber = Math.round(abs);
    } else if (abs >= 1000) {
        formattedNumber = abs.toString().slice(0, 3) + " k";
    }
    return sign + formattedNumber.toString();
};

export default Chart;
