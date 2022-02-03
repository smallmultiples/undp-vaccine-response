import React from "react";
import styles from "./factoid.module.scss";
import { formatManualValue, ManualBlockVis } from "../block-visualisations/block-visualisation";

export default function Factoid(props) {
    const {
        goalDatasets,
        keyStats,
        factoidNumber,
    } = props;

    const onCountryPage = React.useMemo(() => Boolean(props.countryCode), [props.countryCode]);

    const sideBlocks =
        !onCountryPage && keyStats?.filter(s => s["Chart type"] !== "");

    const sideBlock = sideBlocks ? sideBlocks[factoidNumber - 1] : undefined

    const content = () => {
        if (sideBlock["Indicator"] === "Manual entry") {
            return (
                <ManualBlockVis
                    type={sideBlock["Chart type"]}
                    configuration={sideBlock["Configuration"]}
                    manualEntry={{
                        value:
                            sideBlock["Chart type"] === "Factoid"
                                ? formatManualValue(
                                      sideBlock["Stat A value"],
                                      sideBlock["Stat A type"]
                                  )
                                : sideBlock["Stat A value"],
                        primaryLabel: sideBlock["Primary label"],
                        secondaryLabel: sideBlock["Secondary label"],
                        dataSource: sideBlock["Data source"],
                        dataSourceLink: sideBlock["Data source link"],
                        format: sideBlock["Stat A type"],
                    }}
                />
            );
        } else {
            const indicator = sideBlock["Indicator"].split(",");
            const dataFiltered =
                goalDatasets &&
                goalDatasets["BASELINE-01"].filter(
                    x => x[indicator[0]] === indicator[1]
                );
            const value =
                dataFiltered &&
                dataFiltered.reduce((a, b) => a + (b[indicator[2]] || 0), 0) /
                    dataFiltered.length;
            const valueTemp = 100 - value;
                let numerator = Math.round(100 / valueTemp) - 1 === 0 ? 1 : Math.round(100 / valueTemp) - 1;
                const primaryLabel = sideBlock["Primary label"].replace(
                    "1",
                    value ? numerator : "..."
                )
                .replace(
                    "X",
                    value ? Math.round(numerator * 100 / value) : "..."
                );
            return (
                <ManualBlockVis
                    type={sideBlock["Chart type"]}
                    configuration={sideBlock["Configuration"]}
                    manualEntry={{
                        value: Math.round(value * 100) / 100,
                        primaryLabel,
                        secondaryLabel: sideBlock["Secondary label"],
                        dataSource: sideBlock["Data source"],
                        dataSourceLink: sideBlock["Data source link"],
                        format: sideBlock["Stat A type"],
                    }}
                />
            );
        }
    }

    return (
        <div className={styles.goal}>
            <div className={styles.mapArea}>
                {sideBlocks && sideBlocks.length > 0 && (
                    <div className={styles.mapSidebar}>
                        {content()}
                    </div>
                )}
            </div>
        </div>
    );
}
