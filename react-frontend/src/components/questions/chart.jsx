import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { range, extent } from "d3-array";
import styles from "./chart.module.scss";
import useDimensions from "../../hooks/use-dimensions";

const padding = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
};

const useDomains = data => {
    const x = range(0, data.length + 1);
    const yRange = extent(data);
    return {
        x,
        y: yRange,
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

    // Horrible hack to get bands to spread properly. Combined with the + 1 on the domain.
    const bandEndOffset = frame.width / domains.x.length;

    const x = scaleBand()
        .domain(domains.x)
        .range([frame.left, frame.right + bandEndOffset])
        .paddingOuter(0)
        .paddingInner(0.5);

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
    const domains = useDomains(indicatorData);
    const scales = useScales(dimensions, domains);

    const chartProps = {
        data: indicatorData,
        rawData: data,
        dimensions,
        domains,
        scales,
    };

    const ticks = scales && data.length !== 0 && (
        <>
            <Ticks {...chartProps} />
        </>
    );
    const chartContent = scales && data.length !== 0 && (
        <>
            <Data {...chartProps} />
        </>
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
    const { scales, data, rawData } = props;
    const rects = rawData
        .sort((j, k) => j.data - k.data)
        .map((d, i) => {
            const left = scales.x(i);
            const width = scales.x.bandwidth();
            return (
                <rect
                    key={i}
                    className={styles.bar}
                    x={left}
                    width={width}
                    y={scales.y(d.data)}
                    height={scales.y(0) - scales.y(d.data)}
                    data-low={d.hdi < 0.55}
                    data-medium={d.hdi >= 0.55 && d.hdi < 0.7}
                    data-low={d.hdi >= 0.7 && d.hdi < 0.8}
                    data-high={d.hdi >= 0.8}
                />
            );
        });

    const maxVal = Math.max(...data);
    const midVal = maxVal / 2;
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
                    y={scales.y(maxVal)}
                    height={1}
                />
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
        </g>
    );
};

const Ticks = props => {
    const { scales, data } = props;
    const maxVal = Math.max(...data);
    const midVal = maxVal / 2;
    return (
        <div className={styles.ticks}>
            <div
                style={{
                    top: scales.y(maxVal) - 8,
                    position: "absolute",
                }}
            >
                {Math.round(maxVal)}
            </div>
            <div
                style={{
                    top: scales.y(midVal) - 8,
                    position: "absolute",
                }}
            >
                {Math.round(midVal)}
            </div>
            <div
                style={{
                    top: scales.y(0) - 8,
                    position: "absolute",
                }}
            >
                0
            </div>
        </div>
    );
};

export default Chart;
