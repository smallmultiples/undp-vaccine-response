import React from "react";
import Map from "../map/map";
import styles from "./goal.module.scss";
import { useIndicatorState } from "./useIndicatorState";
import { groupBy, uniq, isNil, uniqBy } from "lodash";
import useTimelineState from "./useTimelineState";
import Timeline from "../timeline/timeline";
import regionLookup from "../../modules/data/region-lookup.json";
import { MapBlockVis, formatManualValue, ManualBlockVis } from "./block-visualisation";
import Chart from "../questions/chart";
import Select from "react-select";
import dropdownStyle from "../../modules/dropdown.style";
import DataSources from "../data-sources/data-sources";
import { getIndicatorDataKey, getRowIndicatorValue } from "../../modules/utils";

const ROW_KEY = "Alpha-3 code";
const TIME_KEY = "Year";

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

function useSelectedIndicatorData(goalDatasets, pillarLoading, currentIndicators) {
    const selectedIndicatorData = React.useMemo(() => {
        if (pillarLoading || !goalDatasets) return [];

        let newData = [];

        const enabledIndicators = [
            currentIndicators.bivariateXEnabled && currentIndicators.bivariateX,
            currentIndicators.bivariateYEnabled && currentIndicators.bivariateY,
            currentIndicators.mapVisualisationEnabled && currentIndicators.mapVisualisation,
        ].filter(Boolean);

        const tmp = [];
        enabledIndicators.forEach(indicator => {
            tmp.push({
                dataKey: getIndicatorDataKey(indicator),
                sheet: indicator.goal.sheet,
            });
            if (indicator.tooltipExtraDataKey) {
                tmp.push({
                    dataKey: indicator.tooltipExtraDataKey,
                    sheet: indicator.goal.sheet,
                });
            }
        });

        const selectedDatums = groupBy(tmp, d => d.sheet);

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
        const selectedDatums = [
            currentIndicators.bivariateXEnabled && currentIndicators.bivariateX,
            currentIndicators.bivariateYEnabled && currentIndicators.bivariateY,
            currentIndicators.mapVisualisationEnabled && currentIndicators.mapVisualisation,
        ].filter(Boolean);

        const extraDatums = [
            currentIndicators.bivariateXEnabled && currentIndicators.bivariateX.tooltipExtraDataKey,
            currentIndicators.bivariateYEnabled && currentIndicators.bivariateY.tooltipExtraDataKey,
            currentIndicators.mapVisualisationEnabled &&
                currentIndicators.mapVisualisation.tooltipExtraDataKey,
        ].filter(Boolean);

        Object.entries(countryGrouped).forEach(([rowKey, rows]) => {
            const region = regionLookup.find(r => r["ISO-alpha3 Code"] === rowKey);
            ret[rowKey] = {
                [ROW_KEY]: rowKey,
                ...region,
                dates: {},
            };

            let keysToFill = uniq(selectedDatums.map(getIndicatorDataKey).concat(extraDatums));

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
            <div className={styles.mapArea}>
                {sideBlocks && sideBlocks.length > 0 && (
                    <div className={styles.mapSidebar}>
                        {sideBlocks?.map((sideBlock, i) => {
                            if (sideBlock["Indicator"] === "Manual entry") {
                                return (
                                    <ManualBlockVis
                                        type={sideBlock["Chart type"]}
                                        key={`manual-chart-${i}`}
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
                            }
                            const ind = goal.indicators.find(
                                x => x.dataKey === sideBlock["Indicator"].split(";")[0]
                            );
                            if (!ind) return null;
                            return (
                                <MapBlockVis
                                    indicator={ind}
                                    type={sideBlock["Chart type"]}
                                    configuration={sideBlock["Configuration"]}
                                    key={ind.label}
                                    {...blockProps}
                                />
                            );
                        })}
                    </div>
                )}
                <h3>Explore data about the {goal.label} of vaccines across the world</h3>
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
                selectedCountryCode={selectedCountryCode}
            />
            <DataSources currentIndicators={currentIndicators} />
        </div>
    );
}

const isDef = d => !isNil(d) && d !== "";

const ChartArea = props => {
    const {
        regionLookup,
        currentIndicators,
        setCurrentIndicators,
        goalDatasets,
        selectedCountryCode,
    } = props;

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
                  indicatorDataset.filter(d => isDef(getRowIndicatorValue(d, selectedIndicator))),
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
                    r => r[ROW_KEY] === d[ROW_KEY] && r["Human development index (HDI)"]
                );
                const hdi = hdiRow ? hdiRow["Human development index (HDI)"] : undefined;
                const isSelected = selectedCountryCode === d[ROW_KEY];

                return {
                    country: region ? region["Country or Area"] : d[ROW_KEY],
                    data: d[selectedIndicator.dataKey],
                    hdi,
                    isSelected,
                };
            });

            if (data.length > 0) {
                return <Chart indicator={selectedIndicator} data={data} />;
            }
        }
        return undefined;
    }, [indicatorDataset, year, selectedIndicator, regionLookup, commonData, selectedCountryCode]);

    return (
        <div className={styles.chartArea}>
            <h3>Compare countries, territories and areas</h3>
            <p>
                Select an indicator and a year to plot to see how countries compare. Hover to see
                the country’s data.
            </p>
            <div className={styles.chartSelectors}>
                <Select
                    options={currentIndicators.chartOptions}
                    getOptionLabel={option =>
                        option.tableLabel ? option.tableLabel : option.label
                    }
                    onChange={indicator => {
                        setCurrentIndicators(d => ({ ...d, chart: indicator }));
                    }}
                    value={selectedIndicator}
                    styles={dropdownStyle}
                    isOptionSelected={isOptionSelected}
                    isDisabled={currentIndicators.chartOptions.length <= 1}
                    isSearchable={true}
                    className={styles.indicatorSelector}
                    noGap
                />
                <Select
                    options={yearsArray}
                    onChange={x => setYear(x)}
                    value={year}
                    styles={dropdownStyle}
                    isOptionSelected={isOptionSelected}
                    isDisabled={yearsArray.length <= 1}
                    isSearchable={true}
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
