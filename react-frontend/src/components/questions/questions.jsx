import React from "react";
import styles from "./questions.module.scss";
import Table from "./table";
import { Chevron } from "../icons/icons";
import Badge from "./badge";
import Chart from "./chart";

const COUNTRIES_TOTAL = 249;

const Question = props => {
    const { question, dataset, regionLookup, countryData, hdiIndicator } = props;
    const [isPreviewShown, setIsPreviewShown] = React.useState(false);

    const headers = ["Country", "Region"];

    const rowsForOverviewTable = question.indicators.map(x => {
        const label = x.label;
        const countryCount = x.meta ? x.meta.countryCount : "";

        const cc = (
            <div className={styles.countryCount}>
                <Badge percentage={(countryCount * 100) / COUNTRIES_TOTAL} />
                <div
                    className={styles.label}
                >{`${countryCount} / ${COUNTRIES_TOTAL} countries and areas`}</div>
            </div>
        );

        const currency = x.meta ? x.meta.currency : "";
        const sources = (
            <div>
                {x.meta?.sources.map((s, i) => {
                    return (
                        <span key={`link_${i}`}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer">
                                {s.name}
                            </a>
                            {i < x.meta.sources.length - 1 && ", "}
                        </span>
                    );
                })}
            </div>
        );
        headers.push(label);
        return [label, cc, currency, sources];
    });

    const headersForCountryTable = headers.concat([
        "Confirmed cases, cumulative",
        "Deaths, cumulative",
        "Death rate",
    ]);

    const rowsForCountryTable = dataset?.slice(0, 5).map(x => {
        const region = regionLookup?.find(r => r["ISO-alpha3 Code"] === x["Alpha-3 code"]);
        const country = countryData && countryData[x["Alpha-3 code"]];
        const arr = [x["Country or Area"], region?.["Region Name"] || ""];
        question.indicators.forEach(ind => {
            arr.push(
                typeof x[ind.dataKey] === "number"
                    ? Math.round(x[ind.dataKey] * 10) / 10
                    : x[ind.dataKey]
            );
        });
        if (country) {
            arr.push(country.Cumulative_cases);
            arr.push(country.Cumulative_deaths);
            arr.push(`${Math.round(country.test_death_rate * 10) / 10}%`);
        }
        return arr;
    });

    const chartData = question.indicators
        .map(x => {
            const tmp = [];
            for (const d of dataset || []) {
                tmp.push({
                    country: d["Country or Area"],
                    data: d[x.dataKey],
                    hdi: countryData && countryData[d["Alpha-3 code"]][hdiIndicator?.dataKey],
                });
            }
            const isNumericData = tmp.every(t => typeof t.data === "number" || t.data === "");
            if (tmp.length > 0 && isNumericData) {
                return {
                    indicator: x.label,
                    data: tmp,
                };
            } else {
                return undefined;
            }
        })
        .filter(a => a !== undefined);

    // TODO footer: not always 201 more rows

    return (
        <>
            <div className={styles.question}>
                <div className={styles.questionText}>
                    <div className={styles.label}>{question.label}</div>
                    <button className={styles.downloadButton}>Download CSV</button>
                    <button
                        className={styles.hideButton}
                        onClick={() => setIsPreviewShown(!isPreviewShown)}
                    >
                        {isPreviewShown ? "Hide data preview" : "Show data preview"}
                        <Chevron
                            className={styles.chevron}
                            data-direction={isPreviewShown ? "up" : "down"}
                        />
                    </button>
                </div>
                <div className={styles.overviewTable}>
                    <Table
                        headings={["Indicators", "Coverage", "Currency", "Data source"]}
                        rows={rowsForOverviewTable}
                        fixedColumns={2}
                        fixedColumnsWidth={30}
                    />
                </div>
                <div className={styles.countryTable} data-visible={isPreviewShown}>
                    <Table
                        headings={headersForCountryTable}
                        rows={rowsForCountryTable || []}
                        fixedColumns={2}
                        fixedColumnsWidth={15}
                        withBorders={true}
                        footer={
                            <div className={styles.summary}>
                                <div>201 more rows</div>
                                <button className={styles.downloadButton}>Download CSV</button>
                            </div>
                        }
                    />
                </div>
            </div>
            <div className={styles.chartsContainer}>
                {chartData.length > 0 && <Legend hdiIndicator={hdiIndicator} />}
                {chartData &&
                    chartData.map(x => {
                        return <Chart key={x.indicator} indicator={x.indicator} data={x.data} />;
                    })}
            </div>
        </>
    );
};

const Legend = props => {
    return (
        <div className={styles.legendContainer}>
            <div className={styles.legendTitle}>{props.hdiIndicator?.dataKey}</div>
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

const Questions = props => {
    const { activePillar, datasets, regionLookup, countryData, hdiIndicator } = props;
    return (
        <>
            {activePillar.questions.map((x, i) => (
                <Question
                    key={`${x.labelLong}_${i}`}
                    question={x}
                    dataset={datasets[x.sheet]}
                    regionLookup={regionLookup}
                    countryData={countryData}
                    hdiIndicator={hdiIndicator}
                />
            ))}
        </>
    );
};

export default Questions;
