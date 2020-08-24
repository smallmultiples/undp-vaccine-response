import React from "react";
import Donut from "../block-visualisations/donut-vis/donut";
import Factoid from "../block-visualisations/factoid/factoid";
import LineChart from "../block-visualisations/line-chart/line-chart";
import { getBlockVisValue } from "../block-visualisations/block-vis-utils";
import styles from "./goal.module.scss";

const BlockVisualisations = {
    Donut: Donut,
    Factoid: Factoid,
    "Line chart": LineChart,
};

export function MapBlockVis(props) {
    const {
        indicator,
        type,
        configuration,
        timeFilteredData,
        selectedCountry,
        selectedCountryLabel,
    } = props;
    const Vis = BlockVisualisations[type];
    const style = getVisStyle(configuration);
    const missingChart = <div>{`Missing chart type: ${type}.`}</div>;
    if (!timeFilteredData) {
        return (
            <div className={styles.sidebarBlock} style={style}>
                Missing data
            </div>
        );
    }
    const val = getBlockVisValue(timeFilteredData, indicator, selectedCountry);
    const content = Vis ? (
        <Vis
            value={indicator ? indicator.format(val) : val}
            primaryLabel={indicator.label}
            secondaryLabel={
                <p>
                    <span className={styles.highlight}>{selectedCountryLabel}</span> average
                </p>
            }
        />
    ) : (
        missingChart
    );

    return (
        <div className={styles.sidebarBlock} style={style}>
            {content}
        </div>
    );
}

export function ManualBlockVis(props) {
    const { type, configuration, manualEntry } = props;
    const Vis = BlockVisualisations[type];
    const style = getVisStyle(configuration);
    const missingChart = <div>{`Missing chart type: ${type}.`}</div>;
    const content = Vis ? (
        <Vis
            value={manualEntry.value || ""}
            primaryLabel={manualEntry.primaryLabel}
            secondaryLabel={
                manualEntry.secondaryLabel ? <p>{manualEntry.secondaryLabel}</p> : undefined
            }
            format={manualEntry.format}
        />
    ) : (
        missingChart
    );

    return (
        <div className={styles.sidebarBlock} style={style}>
            {content}
        </div>
    );
}

export const formatManualValue = (value, type) => {
    switch (type) {
        case "usd":
            return "$" + value;
        case "percent":
            return value + "%";
        case "decimal":
        default:
            return value;
    }
};

const getVisStyle = configuration => {
    const conf = configuration !== "" ? JSON.parse(configuration) : undefined;
    if (conf) {
        return conf.type === "vertical"
            ? { gridRowStart: conf.start, gridRowEnd: `span ${conf.size}` }
            : { gridColumnStart: conf.start, gridColumnEnd: `span ${conf.size}` };
    }
};
