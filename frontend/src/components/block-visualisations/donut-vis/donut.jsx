import React from "react";
import styles from "./donut.module.scss";

export default function Donut(props) {
    const { value, primaryLabel, secondaryLabel, dataSource, dataSourceLink } = props;
    const sources = dataSource.split(";");
    const sourcesLinks = dataSourceLink.split(";");
    return (
        <div className={styles.donut}>
            <p>
                <strong>{primaryLabel}</strong>
            </p>
            {!isNaN(value) && <Chart value={value} />}
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

const PADDING = 5;
const CENTER = 150 / 2;
const RADIUS = CENTER - PADDING;

const Chart = props => {
    const { value } = props;

    const startX = CENTER;
    const startY = PADDING;

    const angle = Math.min(value, 99.99) * 3.6;
    const angleRadians = (angle - 90) * (Math.PI / 180);

    const endX = CENTER + Math.cos(angleRadians) * RADIUS;
    const endY = CENTER + Math.sin(angleRadians) * RADIUS;

    const largeFlag = angle > 180 ? "1" : "0";

    const path = `
        M ${startX} ${startY}
        A ${RADIUS} ${RADIUS} 0 ${largeFlag} 1 ${endX} ${endY}
    `;

    return (
        <div className={styles.container}>
            <svg className={styles.svg}>
                <circle className={styles.pathEmpty} r={RADIUS} cx={CENTER} cy={CENTER} />
                <path className={styles.pathFill} d={path} />
            </svg>
            <div className={styles.textOverlay}>
                <span className={styles.valueText}>{value}%</span>
            </div>
        </div>
    );
};
