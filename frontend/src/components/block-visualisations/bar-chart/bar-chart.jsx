import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { range } from "d3-array";
import styles from "./bar-chart.module.scss";
import useDimensions from "../../../hooks/use-dimensions";
import { formatManualValue } from "../block-visualisation";
import { max } from "d3";

export default function BarChart(props) {
    const { value, primaryLabel, secondaryLabel, format, dataSource, dataSourceLink } = props;
    const data = [];
    const dataParsed = JSON.parse(value);
    dataParsed.forEach((d, i) => {
        const dataArray = d.split(";");
        const label = dataArray[0].split(",")[1];
        const valuesArray = dataArray.slice(1, 4);
        const dataFinal = valuesArray.map(y => {
            const val = y.split(",");
            return {
                label: val[0],
                value: val[1],
            };
        });
        data.push({
            label,
            data: dataFinal,
        });
    });
    const sources = dataSource.split(";");
    const sourcesLinks = dataSourceLink.split(";");
    return (
        <div className={styles.lineChart}>
            <p>
                <strong>{primaryLabel}</strong>
            </p>
            <div>
                <Chart data={data} format={format} />
            </div>
            <p className={styles.secondaryLabel}>{secondaryLabel.props.children}</p>
            <small>
                {sources.map((x, i) => {
                    return (
                        <span key={x}>
                            <a
                                target="_parent"
                                className={styles.dataSource}
                                href={sourcesLinks[i]}
                            >
                                {x}
                            </a>
                            {i !== sources.length - 1 ? ", " : ""}
                        </span>
                    );
                })}
            </small>
        </div>
    );
}

const padding = {
    top: 30,
    bottom: 20,
    left: 60,
    right: 60,
};

const useDomains = (data, dataLength) => {
    const x = range(0, dataLength);
    const y = max(data, d => d.value);
    return {
        x,
        y: [0, y],
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
    const { data, format } = props;
    const mergedData = data[1] ? data[0].data.concat(data[1].data) : data[0].data;
    const dataLength = data[1] ? mergedData.length / 2 : mergedData.length;
    const [ref, dimensions] = useDimensions();
    const domains = useDomains(mergedData, dataLength);
    const scales = useScales(dimensions, domains);

    const chartProps = {
        data: mergedData,
        rawData: data,
        dimensions,
        domains,
        scales,
        format,
    };

    const chartContent = scales && data.length !== 0 && <Data {...chartProps} />;

    return (
        <div className={styles.container}>
            <svg className={styles.svg} ref={ref}>
                {chartContent}
            </svg>
        </div>
    );
};

const Data = props => {
    const { scales, rawData, format } = props;

    const bars = data => {
        const columns = values => {
            return values.map((d, i) => {
                const left = scales.x(i);
                const top = scales.y(d.value);
                return (
                    <g key={i}>
                        <foreignObject
                            x={scales.x(i) - 10}
                            y={top - 25}
                            width={scales.x.bandwidth() + 20}
                            height={20}
                            className={styles.chartDataLabel}
                        >
                            {formatManualValue(d.value, format)}
                        </foreignObject>
                        <rect
                            x={left}
                            y={top}
                            width={scales.x.bandwidth()}
                            height={scales.y(0) - scales.y(d.value)}
                            stroke={"#110848"}
                            strokeWidth={2}
                            fill={i === 1 ? "#110848" : "white"}
                        />
                    </g>
                );
            });
        };
        return <g>{columns(data)}</g>;
    };

    return (
        <g>
            <g>{bars(rawData[0].data)}</g>
            <g>
                <foreignObject
                    x={scales.frame.left - 40}
                    y={scales.y(0) - 7}
                    width={20}
                    height={15}
                    className={styles.chartLabel}
                >
                    0
                </foreignObject>
                <rect
                    className={styles.thinLine}
                    x={padding.left - 20}
                    width={scales.frame.width + 40}
                    y={scales.y(0)}
                    height={2}
                />
            </g>
            {rawData[0].data.map((d, i) => {
                return (
                    <foreignObject
                        key={`label-${i}`}
                        x={scales.x(i) - 20}
                        y={scales.frame.height + padding.bottom + 15}
                        width={scales.x.bandwidth() + 40}
                        height={15}
                        className={styles.chartLabel}
                    >
                        {d.label}
                    </foreignObject>
                );
            })}
        </g>
    );
};
