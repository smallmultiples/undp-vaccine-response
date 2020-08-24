import React from "react";
import { getBlockVisValue } from "../block-vis-utils";
import styles from "./donut.module.scss";

export default function Donut(props) {
    const { indicator, selectedCountryCode, selectedCountryLabel, timeFilteredData } = props;
    const val = getBlockVisValue(timeFilteredData, indicator, selectedCountryCode);

    return (
        <div className={styles.donut}>
            <h3>{indicator.label}</h3>
            <h2>{indicator.format(val)}</h2>
            <h4>{selectedCountryLabel} average</h4>
        </div>
    );
}
