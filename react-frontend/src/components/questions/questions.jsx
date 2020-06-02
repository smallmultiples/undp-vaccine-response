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
        const arr = [x["Country or Area"], region["Region Name"] || ""];
        question.indicators.forEach(ind => {
            arr.push(Math.round(x[ind.dataKey] * 10) / 10);
        });
        if (country) {
            arr.push(country.Cumulative_cases);
            arr.push(country.Cumulative_deaths);
            arr.push(`${Math.round(country.test_death_rate * 10) / 10}%`);
        }
        return arr;
    });

    const chartData = question.indicators.map(x => {
        const tmp = [];
        for (const d of dataset || []) {
            tmp[d["Country or Area"]] = d[x.dataKey];
            tmp.push({
                country: d["Country or Area"],
                data: d[x.dataKey],
                hdi: countryData && countryData[d["Alpha-3 code"]][hdiIndicator.dataKey]
            })
        }
        return {
            indicator: x.label,
            data: tmp,
        };
    });

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
                {chartData && chartData.map(x => {
                    return <Chart key={x.indicator} indicator={x.indicator} data={x.data} />;
                })}
            </div>
        </>
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
