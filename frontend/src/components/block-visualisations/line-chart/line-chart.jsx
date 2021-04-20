import React from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { range } from "d3-array";
import styles from "./line-chart.module.scss";
import useDimensions from "../../../hooks/use-dimensions";
import { formatManualValue } from "../../goal/block-visualisation";
import { max } from "d3";

export default function LineChart(props) {
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
            color: dataParsed.length === 1 ? "#110848" : i === 0 ? "#110848" : "#0969FA",
            data: dataFinal,
        });
    });

    return (
        <div className={styles.lineChart}>
            <p>
                <strong>{primaryLabel}</strong>
            </p>
            <div>
                <div className={styles.legend}>
                    {data.map(d => {
                        return (
                            <div key={d.label} className={styles.legendItem}>
                                {d.label}
                                <div
                                    className={styles.legendLine}
                                    style={{ backgroundColor: d.color }}
                                />
                            </div>
                        );
                    })}
                </div>
                <Chart data={data} format={format} />
            </div>
            <p className={styles.secondaryLabel}>{secondaryLabel.props.children}</p>
            <small><a target="_parent" className={styles.dataSource} href={dataSourceLink}>{dataSource}</a></small>
        </div>
    );
}

const padding = {
    top: 30,
    bottom: 20,
    left: 10,
    right: 10,
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

    const lineWithDots = (data, color, labelPosition) => {
        const dots = values => {
            return values.map((d, i) => {
                const left = scales.x(i) + scales.x.bandwidth() / 2;
                const top = scales.y(d.value);
                return (
                    <g key={i}>
                        <foreignObject
                            x={scales.x(i)}
                            y={labelPosition === "below" ? top + 10 : top - 25}
                            width={scales.x.bandwidth()}
                            height={20}
                            className={styles.chartDataLabel}
                            style={{ color: color }}
                        >
                            {formatManualValue(d.value, format)}
                        </foreignObject>
                        <circle
                            cx={left}
                            cy={top}
                            r="5"
                            stroke={color}
                            strokeWidth={2}
                            fill={"white"}
                        />
                    </g>
                );
            });
        };
        const line = (dataSet, numberStart, numberEnd) => {
            const start = {
                x: scales.x(numberStart) + scales.x.bandwidth() / 2,
                y: scales.y(dataSet[numberStart].value),
            };
            const end = {
                x: scales.x(numberEnd) + scales.x.bandwidth() / 2,
                y: scales.y(dataSet[numberEnd].value),
            };
            return (
                <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={color}
                    strokeWidth={2}
                />
            );
        };

        const dotsSet = dots(data);
        const lines = [];
        for (let i = 0; i < data.length - 1; i++) {
            lines.push(line(data, i, i+1));
        }
        return (
            <g>
                {lines}
                {dotsSet}
            </g>
        );
    };

    return (
        <g>
            <g>{lineWithDots(rawData[0].data, rawData[0].color, rawData[1] ? "below" : "above")}</g>
            {rawData[1] && <g>{lineWithDots(rawData[1].data, rawData[1].color, "above")}</g>}
            <g>
                <rect
                    className={styles.thinLine}
                    x={padding.left + 10}
                    width={scales.frame.width - 20}
                    y={scales.y(0)}
                    height={2}
                />
            </g>
            {rawData[0].data.map((d, i) => {
                return (
                    <foreignObject
                        key={`label-${i}`}
                        x={scales.x(i)}
                        y={scales.frame.height + padding.bottom + 15}
                        width={scales.x.bandwidth()}
                        height={30}
                        className={styles.chartLabel}
                    >
                        {d.label}
                    </foreignObject>
                );
            })}
        </g>
    );
};
