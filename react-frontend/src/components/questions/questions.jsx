import React from "react";
import styles from "./questions.module.scss";
import Table from "./table";
import { Chevron } from "../icons/icons";

const COUNTRIES_TOTAL = 216;

const Question = props => {
    const { question, dataset, regionLookup, countryData } = props;
    const [isPreviewShown, setIsPreviewShown] = React.useState(true);

    const headers = ["Country", "Region"];

    const rowsForOverviewTable = question.indicators.map(x => {
        const label = x.label;
        const countryCount = x.meta ? x.meta.countryCount : "";
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
        return [label, `${countryCount} / ${COUNTRIES_TOTAL}`, currency, sources];
    });

    const headersForCountryTable = headers.concat([
        "Confirmed cases, cumulative",
        "Deaths, cumulative",
        "Death rate",
    ]);
    const rowsForCountryTable = dataset?.slice(0, 5).map(x => {
        const region = regionLookup?.find(r => r["ISO-alpha3 Code"] === x["Alpha-3 code"]);
        const country = countryData && countryData[x["Alpha-3 code"]];
        const arr = [x.Country, region["Region Name"] || ""];
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

    return (
        <div className={styles.question}>
            <div className={styles.questionText}>
                <div className={styles.label}>{question.label}</div>
                <div className={styles.explanation}>
                    Data coverage ranges from 90% to 100% of countries. Historical data is from 2010
                    - 2018, with COVID-19 related data last updated 25 May 2020, sourced from World
                    Bank and WHO.
                </div>
                <button className={styles.downloadButton}>Download CSV</button>
                <button
                    className={styles.hideButton}
                    onClick={() => setIsPreviewShown(!isPreviewShown)}
                >
                    {isPreviewShown ? "Hide data peview" : "Show data preview"}
                    <Chevron
                        className={styles.chevron}
                        data-direction={isPreviewShown ? "up" : "down"}
                    />
                </button>
            </div>
            <div className={styles.overviewTable}>
                <Table
                    headings={["Indicators", "Country coverage", "Currency", "Data source"]}
                    rows={rowsForOverviewTable}
                    fixedColumns={1}
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
    );
};

const Questions = props => {
    const { activePillar, datasets, regionLookup, countryData } = props;
    return (
        <>
            {activePillar.questions.map(x => (
                <Question
                    key={x.labelShort}
                    question={x}
                    dataset={datasets[x.sheet]}
                    regionLookup={regionLookup}
                    countryData={countryData}
                />
            ))}
        </>
    );
};

export default Questions;
