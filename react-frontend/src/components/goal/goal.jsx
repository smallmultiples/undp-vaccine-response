import React from "react";
import Map from "../map/map";
import styles from "./goal.module.scss";
import { useIndicatorState } from "./useIndicatorState";
import { isObject, groupBy, uniq, isNil } from "lodash";
import useTimelineState from "./useTimelineState";
import Timeline from "../timeline/timeline";
import Donut from "../block-visualisations/donut-vis/donut";
import Factoid from "../block-visualisations/factoid/factoid";
import { getBlockVisValue } from "../block-visualisations/block-vis-utils";
import { MapBlockVis, formatManualValue, ManualBlockVis } from "./block-visualisation";

const ROW_KEY = "Alpha-3 code";
const TIME_KEY = "Year";

function useSelectedIndicatorData(goalDatasets, pillarLoading, currentIndicators) {
    const selectedIndicatorData = React.useMemo(() => {
        if (pillarLoading || !goalDatasets) return [];

        let newData = [];

        const selectedDatums = groupBy(
            Object.values(currentIndicators)
                .filter(isObject)
                .map(indicator => ({
                    dataKey: indicator.dataKey,
                    sheet: indicator.goal.sheet,
                })),
            d => d.sheet
        );

        // TODO: also extract for "blockVisOnly"

        Object.entries(selectedDatums).forEach(([sheet, datums]) => {
            // NEWEST data is first. This let's us build the map faster.
            const dateSorted = goalDatasets[sheet].sort((a, b) => b[TIME_KEY] - a[TIME_KEY]);
            const uniqueDataKeysForSheet = uniq(datums.map(d => d.dataKey));

            // Just extract required datums.
            const newRows = dateSorted
                .map(row => {
                    let outRow = null;
                    uniqueDataKeysForSheet.forEach(dataKey => {
                        const value = row[dataKey];
                        if (value === "" || value === null || value === undefined) return;
                        if (!outRow) {
                            outRow = {
                                [ROW_KEY]: row[ROW_KEY],
                                [TIME_KEY]: row[TIME_KEY],
                            };
                        }
                        outRow[dataKey] = row[dataKey];
                    });
                    return outRow;
                })
                .filter(Boolean);

            newData = newData.concat(newRows);
        });

        return newData;
    }, [goalDatasets, pillarLoading, currentIndicators]);

    return selectedIndicatorData;
}

function useTimeFilteredData(
    selectedIndicatorData,
    currentIndicators,
    regionLookup,
    timelineState
) {
    // Take only matching rows.
    // TODO: split up by timespan and current time?
    // TODO: use a binary search. sortedIndex?
    const timeFiltered = React.useMemo(
        () => selectedIndicatorData.filter(d => d[TIME_KEY] <= timelineState.currentTime),
        [selectedIndicatorData, timelineState]
    );

    const countryGrouped = React.useMemo(() => groupBy(timeFiltered, d => d[ROW_KEY]), [
        timeFiltered,
    ]);

    // Take the rows and put them into a {[key]: {values}} map.
    const outputMap = React.useMemo(() => {
        let ret = {};
        const selectedDatums = Object.values(currentIndicators).filter(isObject);

        Object.entries(countryGrouped).forEach(([rowKey, rows]) => {
            const region = regionLookup.find(r => r["ISO-alpha3 Code"] === rowKey);
            ret[rowKey] = {
                [ROW_KEY]: rowKey,
                ...region,
            };

            let keysToFill = uniq(selectedDatums.map(indicator => indicator.dataKey));

            for (let row of rows) {
                for (let dataKey of keysToFill.slice()) {
                    const rowValue = row[dataKey];
                    if (!isNil(rowValue)) {
                        // If it is a non nil value, copy to the output object
                        ret[rowKey][dataKey] = rowValue;
                        // And remove the key from the list  we need to fill
                        keysToFill = keysToFill.filter(d => d !== dataKey);
                    }
                }

                // If filled all keys, we can stop iterating.
                if (keysToFill.length === 0) {
                    break;
                }
            }
        });
        return ret;
    }, [countryGrouped, currentIndicators, regionLookup]);

    return outputMap;
}

export default function Goal(props) {
    const { goal, pillar, regionLookup, pillarLoading, goalDatasets, keyStats } = props;
    const [selectedCountry, setSelectedCountry] = React.useState(null);
    const selectedCountryLabel = React.useMemo(
        () => (selectedCountry ? selectedCountry.NAME : "Global"),
        [selectedCountry]
    );

    const handleCountryClicked = React.useCallback(country => {
        setSelectedCountry(existing =>
            existing && existing.ISO3 === country.ISO3 ? null : country
        );
    }, []);

    // Hooks
    // TODO: make this context?
    const [currentIndicators, setCurrentIndicators] = useIndicatorState(pillar, goal);
    const selectedIndicatorData = useSelectedIndicatorData(
        goalDatasets,
        pillarLoading,
        currentIndicators
    );
    const timelineState = useTimelineState(selectedIndicatorData);
    const timeFilteredData = useTimeFilteredData(
        selectedIndicatorData,
        currentIndicators,
        regionLookup,
        timelineState
    );

    const sideBlocks = keyStats.filter(s => s["Bucket"] === goal.id && s["Chart type"] !== "");
    const blockProps = {
        selectedCountry,
        selectedCountryLabel,
        timeFilteredData,
        selectedIndicatorData,
    };

    return (
        <div className={styles.goal}>
            <div className={styles.tempGoalHeader}>
                <h2>{goal.label}</h2>
                <p>{goal.description}</p>
            </div>
            <div className={styles.mapArea}>
                <div className={styles.mapSidebar}>
                    {sideBlocks.map((s, i) => {
                        if (s["Indicator"] === "Manual entry") {
                            return (
                                <ManualBlockVis
                                    type={s["Chart type"]}
                                    key={`manual-chart-${i}`}
                                    configuration={s["Configuration"]}
                                    manualEntry={{
                                        value: formatManualValue(s["Stat A value"], s["Stat A type"]),
                                        secondaryLabel: s["Stat A label"],
                                    }}
                                />
                            );
                        }
                        const ind = goal.indicators.find(
                            x => x.dataKey === s["Indicator"].split(";")[0]
                        );
                        if (!ind) return null;
                        return (
                            <MapBlockVis
                                indicator={ind}
                                type={s["Chart type"]}
                                configuration={s["Configuration"]}
                                key={ind.label}
                                {...blockProps}
                            />
                        );
                    })}
                </div>
                <div className={styles.mapContainer}>
                    <Map
                        countryData={timeFilteredData}
                        countryDataLoading={pillarLoading}
                        pillar={pillar}
                        goal={goal}
                        currentIndicators={currentIndicators}
                        setCurrentIndicators={setCurrentIndicators}
                        onCountryClicked={handleCountryClicked}
                        selectedCountry={selectedCountry}
                    />
                </div>
            </div>
            <div className={styles.timeArea}>
                <Timeline timelineState={timelineState} />
            </div>
        </div>
    );
}
