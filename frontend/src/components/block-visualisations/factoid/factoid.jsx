import React from "react";
import styles from "./factoid.module.scss";

export default function Factoid(props) {
    const { value, primaryLabel, secondaryLabel, dataSource, dataSourceLink } = props;
    const sources = dataSource.split(";");
    const sourcesLinks = dataSourceLink.split(";");
    return (
        <div className={styles.factoid}>
            <p>
                <strong>{primaryLabel}</strong>
            </p>
            <h1 className={styles.factoidNumber}>{value}</h1>
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
