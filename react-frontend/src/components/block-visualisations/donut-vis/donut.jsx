import React from "react";
import { getBlockVisValue } from "../block-vis-utils";

export default function Donut(props) {
    const { indicator, selectedCountry, selectedCountryLabel, timeFilteredData } = props;
    const val = getBlockVisValue(timeFilteredData, indicator, selectedCountry);

    return (
        <div>
            <h3>{indicator.label}</h3>
            <h2>{val}%</h2>
            <h4>{selectedCountryLabel} average %</h4>
        </div>
    );
}
