import React from "react";
import Map from "../map/map";
import styles from "./goal.module.scss";
import { useIndicatorState } from "./useIndicatorState";
import { isObject, groupBy, uniq, isNil, uniqBy } from "lodash";
import useTimelineState from "./useTimelineState";
import Timeline from "../timeline/timeline";
import regionLookup from "../../modules/data/region-lookup.json";
import { MapBlockVis, formatManualValue, ManualBlockVis } from "./block-visualisation";
import Chart from "../questions/chart";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import DataSources from "../data-sources/data-sources";

const ROW_KEY = "Alpha-3 code";
const TIME_KEY = "Year";

function useSelectedIndicatorData(goalDatasets, pillarLoading, currentIndicators) {
    const selectedIndicatorData = React.useMemo(() => {
        if (pillarLoading || !goalDatasets) return [];

        let newData = [];

        const selectedDatums = groupBy(
            Object.values(currentIndicators)
                .filter(d => d.label)
                .map(indicator => ({
                    dataKey: indicator.dataKey,
                    sheet: indicator.goal.sheet,
                }))
                .concat([
                    {
                        dataKey: "Human development index (HDI)",
                        sheet: "BASELINE-01",
                    },
                ]),
            d => d.sheet
        );

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

function useTimeFilteredData(selectedIndicatorData, currentIndicators, timelineState) {
    // Take only matching rows.
    // TODO: split up by timespan and current time?
    // TODO: use a binary search. sortedIndex?
    const timeFiltered = React.useMemo(
        () =>
            selectedIndicatorData.filter(
                d =>
                    d[TIME_KEY] &&
                    timelineState.currentTime &&
                    d[TIME_KEY].getYear() <= timelineState.currentTime.getYear()
            ),
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

            let keysToFill = uniq(selectedDatums.map(indicator => indicator.dataKey)).concat([
                "Human development index (HDI)",
            ]);

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
    }, [countryGrouped, currentIndicators]);

    return outputMap;
}

export default function Goal(props) {
    const {
        goal,
        pillar,
        pillarLoading,
        goalDatasets,
        countryCode,
        keyStats,
        commonPillar,
    } = props;
    const [selectedCountryCode, setSelectedCountryCode] = React.useState(countryCode || null);
    const selectedCountryLabel = React.useMemo(() => {
        if (!selectedCountryCode) return "Global";
        const row = regionLookup.find(row => row["ISO-alpha3 Code"] === selectedCountryCode);
        if (!row) throw new Error("Could not find country code row " + selectedCountryCode);
        return row["Country or Area"];
    }, [selectedCountryCode]);

    const onCountryPage = React.useMemo(() => Boolean(props.countryCode), [props.countryCode]);

    const handleCountryClicked = React.useCallback(country => {
        setSelectedCountryCode(existing =>
            existing && existing === country.ISO3 ? null : country.ISO3
        );
    }, []);

    // Hooks
    const [currentIndicators, setCurrentIndicators] = useIndicatorState(goal, commonPillar);
    const selectedIndicatorData = useSelectedIndicatorData(
        goalDatasets,
        pillarLoading,
        currentIndicators
    );
    const timelineState = useTimelineState(selectedIndicatorData);
    const timeFilteredData = useTimeFilteredData(
        selectedIndicatorData,
        currentIndicators,
        timelineState
    );

    const sideBlocks =
        !onCountryPage && keyStats?.filter(s => s["Bucket"] === goal.id && s["Chart type"] !== "");
    const blockProps = {
        selectedCountryCode,
        selectedCountryLabel,
        timeFilteredData,
        selectedIndicatorData,
    };

    return (
        <div className={styles.goal}>
            <div className={styles.mapArea}>
                {sideBlocks && sideBlocks.length > 0 && (
                    <div className={styles.mapSidebar}>
                        {sideBlocks?.map((s, i) => {
                            if (s["Indicator"] === "Manual entry") {
                                return (
                                    <ManualBlockVis
                                        type={s["Chart type"]}
                                        key={`manual-chart-${i}`}
                                        configuration={s["Configuration"]}
                                        manualEntry={{
                                            value:
                                                s["Chart type"] === "Factoid"
                                                    ? formatManualValue(
                                                          s["Stat A value"],
                                                          s["Stat A type"]
                                                      )
                                                    : s["Stat A value"],
                                            primaryLabel: s["Primary label"],
                                            secondaryLabel: s["Secondary label"],
                                            dataSource: s["Data source"],
                                            dataSourceLink: s["Data source link"],
                                            format: s["Stat A type"],
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
                )}
                <div className={styles.mapContainer}>
                    <Map
                        countryData={timeFilteredData}
                        countryDataLoading={pillarLoading}
                        pillar={pillar}
                        goal={goal}
                        currentIndicators={currentIndicators}
                        setCurrentIndicators={setCurrentIndicators}
                        onCountryClicked={handleCountryClicked}
                        selectedCountryCode={selectedCountryCode}
                        countryCode={countryCode}
                    />
                </div>
            </div>
            <div className={styles.timeArea}>
                <Timeline timelineState={timelineState} />
            </div>
            <ChartArea
                pillar={pillar}
                goalDatasets={goalDatasets}
                goal={goal}
                pillarLoading={pillarLoading}
                regionLookup={regionLookup}
                currentIndicators={currentIndicators}
                setCurrentIndicators={setCurrentIndicators}
                selectedIndicatorData={selectedIndicatorData}
            />
            <DataSources currentIndicators={currentIndicators} />
        </div>
    );
}

const ChartArea = props => {
    const { regionLookup, currentIndicators, setCurrentIndicators, selectedIndicatorData } = props;
    const [yearsArray, setYearsArray] = React.useState([]);
    const [year, setYear] = React.useState(undefined);

    const selectedIndicator = React.useMemo(() => currentIndicators.chart, [currentIndicators]);

    React.useEffect(() => {
        const uniqueYearDatums = selectedIndicatorData
            ? uniqBy(
                  selectedIndicatorData.filter(d => !isNil(d[selectedIndicator.dataKey])),
                  d => d.Year.getFullYear()
              )
            : [];

        const yearsArray = uniqueYearDatums.map(row => {
            const v = row.Year.getFullYear();
            return {
                label: v,
                value: v,
            };
        });

        setYearsArray(yearsArray);
        setYear(yearsArray[0]);
    }, [selectedIndicatorData]);

    const chart = React.useMemo(() => {
        const tmp = [];
        let data = undefined;
        if (year) {
            const selectedYearData = selectedIndicatorData.filter(
                o => new Date(o["Year"]).getFullYear() === year.value
            );
            for (const d of selectedYearData || []) {
                if (d[selectedIndicator.dataKey] !== undefined) {
                    const region = regionLookup.find(r => r["ISO-alpha3 Code"] === d[ROW_KEY]);
                    const hdiRow = selectedIndicatorData.find(
                        r => r[ROW_KEY] === d[ROW_KEY] && r["Human development index (HDI)"]
                    );
                    const hdi = hdiRow ? hdiRow["Human development index (HDI)"] : undefined;

                    tmp.push({
                        country: region ? region["Country or Area"] : d[ROW_KEY],
                        data: d[selectedIndicator.dataKey],
                        hdi,
                    });
                }
            }
            if (tmp.length > 0) {
                data = {
                    indicator: selectedIndicator,
                    data: tmp.filter(d => d.data !== ""),
                };
            }
        }
        return data ? <Chart indicator={data.indicator} data={data.data} /> : undefined;
    }, [selectedIndicatorData, year, selectedIndicator, regionLookup]);

    return (
        <div className={styles.chartArea}>
            <h3>Explore indicators</h3>
            <p>
                Select an indicator and a year to plot to see how countries compare. Hover to see
                the country’s data.
            </p>
            <div className={styles.chartSelectors}>
                <Select
                    options={currentIndicators.chartOptions}
                    onChange={indicator => {
                        setCurrentIndicators(d => ({ ...d, chart: indicator }));
                    }}
                    value={selectedIndicator}
                    styles={dropdownStyle}
                    isOptionSelected={false}
                    isDisabled={currentIndicators.chartOptions.length <= 1}
                    isSearchable={false}
                    className={styles.indicatorSelector}
                    noGap
                />
                <Select
                    options={yearsArray}
                    onChange={x => setYear(x)}
                    value={year}
                    styles={dropdownStyle}
                    isOptionSelected={false}
                    isDisabled={yearsArray.length <= 1}
                    isSearchable={false}
                    className={styles.yearSelector}
                    noGap
                />
            </div>
            {chart}
        </div>
    );
};
