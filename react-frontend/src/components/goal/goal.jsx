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

        const enabledIndicators = [
            currentIndicators.bivariateXEnabled && currentIndicators.bivariateX,
            currentIndicators.bivariateYEnabled && currentIndicators.bivariateY,
            currentIndicators.mapVisualisationEnabled && currentIndicators.mapVisualisation,
        ].filter(Boolean);

        const selectedDatums = groupBy(
            enabledIndicators.map(indicator => ({
                dataKey: indicator.dataKey,
                sheet: indicator.goal.sheet,
            })),
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
                dates: {},
            };

            let keysToFill = uniq(selectedDatums.map(indicator => indicator.dataKey));

            for (let row of rows) {
                for (let dataKey of keysToFill.slice()) {
                    const rowValue = row[dataKey];
                    if (!isNil(rowValue)) {
                        // If it is a non nil value, copy to the output object
                        ret[rowKey][dataKey] = rowValue;
                        ret[rowKey].dates[dataKey] = row[TIME_KEY];
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
            {goal.incomplete ? (
                <div className={styles.comingSoonBanner}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M12 2V6"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M12 18V22"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M4.93018 4.93005L7.76018 7.76005"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M16.2402 16.24L19.0702 19.07"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M2 12H6"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M18 12H22"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M4.93018 19.07L7.76018 16.24"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M16.2402 7.76005L19.0702 4.93005"
                            stroke="#0969FA"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>

                    <p>
                        <strong>We're still working</strong> on adding more more indicators are
                        added to this tool.
                    </p>
                </div>
            ) : null}
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
                goalDatasets={goalDatasets}
                regionLookup={regionLookup}
                currentIndicators={currentIndicators}
                setCurrentIndicators={setCurrentIndicators}
                selectedIndicatorData={selectedIndicatorData}
            />
            <DataSources currentIndicators={currentIndicators} />
        </div>
    );
}

const isDef = d => !isNil(d) && d !== "";

const ChartArea = props => {
    const { regionLookup, currentIndicators, setCurrentIndicators, goalDatasets } = props;
    const [yearsArray, setYearsArray] = React.useState([]);
    const [year, setYear] = React.useState(undefined);

    const selectedIndicator = React.useMemo(() => currentIndicators.chart, [currentIndicators]);
    const indicatorDataset = React.useMemo(
        () => goalDatasets && goalDatasets[selectedIndicator.goal.sheet],
        [goalDatasets, selectedIndicator]
    );
    const commonData = React.useMemo(() => goalDatasets && goalDatasets["BASELINE-01"], [
        goalDatasets,
    ]);

    React.useEffect(() => {
        const uniqueYearDatums = indicatorDataset
            ? uniqBy(
                  indicatorDataset.filter(d => isDef(d[selectedIndicator.dataKey])),
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
    }, [indicatorDataset, selectedIndicator]);

    const chart = React.useMemo(() => {
        if (year) {
            const selectedYearData = indicatorDataset
                .filter(o => new Date(o["Year"]).getFullYear() === year.value)
                .filter(d => isDef(d[selectedIndicator.dataKey]));
            const data = selectedYearData.map(d => {
                const region = regionLookup.find(r => r["ISO-alpha3 Code"] === d[ROW_KEY]);
                const hdiRow = commonData.find(
                    r =>
                        r[ROW_KEY] === d[ROW_KEY] &&
                        r["Human development index (HDI)"] &&
                        r.Year.getFullYear() === 2018
                );
                const hdi = hdiRow ? hdiRow["Human development index (HDI)"] : undefined;

                return {
                    country: region ? region["Country or Area"] : d[ROW_KEY],
                    data: d[selectedIndicator.dataKey],
                    hdi,
                };
            });

            if (data.length > 0) {
                return <Chart indicator={selectedIndicator} data={data} />;
            }
        }
        return undefined;
    }, [indicatorDataset, year, selectedIndicator, regionLookup, commonData]);

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
                    getOptionLabel={option => option.tableLabel ? option.tableLabel : option.label}
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
                <Legend />
            </div>
            {chart}
        </div>
    );
};

const Legend = props => {
    return (
        <div className={styles.legendContainer}>
            <div className={styles.legendTitle}>Human Development Group (2018)</div>
            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={styles.box} data-na={true} />
                    <span>N/A</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.box} data-low={true} />
                    <span>Low</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.box} data-medium={true} />
                    <span>Medium</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.box} data-high={true} />
                    <span>High</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={styles.box} data-very-high={true} />
                    <span>Very high</span>
                </div>
            </div>
        </div>
    );
};
