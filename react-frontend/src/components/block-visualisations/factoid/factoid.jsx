import React from "react";
import styles from "./factoid.module.scss";

export default function Factoid(props) {
    const { value, primaryLabel, secondaryLabel } = props;
    return (
        <div className={styles.factoid}>
            <p><strong>{primaryLabel}</strong></p>
            <h1 className={styles.factoidNumber}>{value}</h1>
            {secondaryLabel}
        </div>
    );
}
