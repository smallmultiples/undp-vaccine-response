import React from "react";
import styles from "./factoid.module.scss";

export default function Factoid(props) {
    const { value, primaryLabel, secondaryLabel, dataSource, dataSourceLink } = props;
    return (
        <div className={styles.factoid}>
            <p><strong>{primaryLabel}</strong></p>
            <h1 className={styles.factoidNumber}>{value}</h1>
            <p className={styles.secondaryLabel}>{secondaryLabel.props.children}</p>
        	<small><a target="_parent" className={styles.dataSource} href={dataSourceLink}>{dataSource}</a></small>
        </div>
    );
}
