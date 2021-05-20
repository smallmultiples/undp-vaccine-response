import React from "react";
import styles from "./bubble.module.scss";

export default function Bubble(props) {
    const { value, primaryLabel, secondaryLabel, dataSource, dataSourceLink } = props;
    const sources = dataSource.split(";");
    const sourcesLinks = dataSourceLink.split(";");
    return (
        <div className={styles.bubbleChart}>
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

const Chart = props => {
    const { value } = props;

    const v = (250 * value) / 100;

    const bubbles = [];
    for (let i = 0; i < 250; i++) {
        const colored =
            i === Math.floor(v) && v !== Math.floor(v) ? "half" : i <= v ? "full" : "empty";
        bubbles.push(colored);
    }

    return (
        <div>
            <div className={styles.container}>
                {bubbles.map((x, i) => {
                    return (
                        <div
                            key={`bubble-${i}`}
                            className={styles.bubble}
                            data-full={x === "full"}
                            data-half={x === "half"}
                        />
                    );
                })}
            </div>
            <div className={styles.percentText}>{value}%</div>
        </div>
    );
};
