import React from "react";
import Donut from "../block-visualisations/donut-vis/donut";
import Bubble from "../block-visualisations/bubble-vis/bubble";
import Factoid from "../block-visualisations/factoid/factoid";
import BarChart from "../block-visualisations/bar-chart/bar-chart";
import LineChart from "../block-visualisations/line-chart/line-chart";
import { getBlockVisValue } from "../block-visualisations/block-vis-utils";
import styles from "./goal.module.scss";

const BlockVisualisations = {
    Donut: Donut,
    Bubble: Bubble,
    Factoid: Factoid,
    "Line chart": LineChart,
    "Bar chart": BarChart,
};

export function MapBlockVis(props) {
    const { indicator, type, timeFilteredData, selectedCountryCode, selectedCountryLabel } = props;
    const Vis = BlockVisualisations[type];
    const missingChart = <div>{`Missing chart type: ${type}.`}</div>;
    if (!timeFilteredData) {
        return <div className={styles.sidebarBlock}>Missing data</div>;
    }
    const val = getBlockVisValue(timeFilteredData, indicator, selectedCountryCode);
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

    return <div className={styles.sidebarBlock}>{content}</div>;
}

export function ManualBlockVis(props) {
    const { type, manualEntry } = props;
    const Vis = BlockVisualisations[type];
    const missingChart = <div>{`Missing chart type: ${type}.`}</div>;
    const content = Vis ? (
        <Vis
            value={manualEntry.value || ""}
            primaryLabel={manualEntry.primaryLabel}
            secondaryLabel={
                manualEntry.secondaryLabel ? <p>{manualEntry.secondaryLabel}</p> : undefined
            }
            dataSource={manualEntry.dataSource ? manualEntry.dataSource : undefined}
            dataSourceLink={manualEntry.dataSourceLink ? manualEntry.dataSourceLink : undefined}
            format={manualEntry.format}
        />
    ) : (
        missingChart
    );

    return <div className={styles.sidebarBlock}>{content}</div>;
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
