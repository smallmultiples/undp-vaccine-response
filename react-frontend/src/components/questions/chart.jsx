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
    const x = range(0, Object.values(data).length + 1);
    const maxVal = extent(Object.values(data));
    return {
        x,
        y: maxVal,
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
    const domains = useDomains(data);
    const scales = useScales(dimensions, domains);

    const chartProps = {
        ...props,
        dimensions,
        domains,
        scales,
    };

    console.log(data);

    const ticks = scales && data && (
        <>
            <Ticks {...chartProps} />
        </>
    );
    const chartContent = scales && data && (
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
    const { scales, data } = props;
    const rects = Object.values(data)
        .sort((j, k) => j - k)
        .map((d, i) => {
            const left = scales.x(i);
            const width = scales.x.bandwidth();
            return (
                <rect
                    key={i}
                    className={styles.bar}
                    x={left}
                    width={width}
                    y={scales.y(d)}
                    height={250 - scales.y(d)}
                    data-portfolio={d.portfolio || false}
                    data-target={d.target || false}
                    data-below={d.value >= 0}
                />
            );
        });

    const maxVal = Math.max(...Object.values(data));
    const midVal = maxVal / 2;
    return (
        <g>
            <g>
                <rect
                    className={styles.line}
                    x={0}
                    width={scales.frame.width}
                    y={scales.y(0) - 2}
                    height={2}
                />
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
        </g>
    );
};

const Ticks = props => {
    const { scales, data } = props;
    const maxVal = Math.max(...Object.values(data));
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
