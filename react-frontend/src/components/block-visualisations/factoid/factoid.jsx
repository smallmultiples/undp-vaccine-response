import React from "react";
import { getBlockVisValue } from "../block-vis-utils";
import styles from "./factoid.module.scss";

export default function Factoid(props) {
    const { indicator, selectedCountry, selectedCountryLabel, timeFilteredData } = props;
    const val = getBlockVisValue(timeFilteredData, indicator, selectedCountry);
    return (
        <div className={styles.factoid}>
            <p><strong>{indicator.label}</strong></p>
            <h1 className={styles.factoidNumber}>{indicator.format(val)}</h1>
            <p><span className={styles.highlight}>{selectedCountryLabel}</span> average</p>
        </div>
    );
}
