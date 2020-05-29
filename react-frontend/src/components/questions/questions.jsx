import React from "react";
import styles from "./questions.module.scss";
import Table from "./table";
import { Chevron } from "../icons/icons";

const COUNTRIES_TOTAL = 216;

const Question = props => {
    const { question, dataset } = props;
    const [isPreviewShown, setIsPreviewShown] = React.useState(true);

    const headersForCountryTable = ["Country", "Region"];

    const rowsForOverviewTable = question.indicators.map(x => {
        headersForCountryTable.push(x.label);
        return [x.label, "one", "two", "three"];
    });

    const rowsForCountryTable = dataset?.slice(0, 5).map(x => {
        const arr = [x.Country, "Region"];
        question.indicators.forEach(ind => {
            arr.push(x[ind.dataKey]);
        });
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
                    fixedColumnsWidth={40}
                />
            </div>
            <div className={styles.countryTable} data-visible={isPreviewShown}>
                <Table
                    headings={headersForCountryTable}
                    rows={rowsForCountryTable || []}
                    fixedColumns={2}
                    fixedColumnsWidth={20}
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
    const { activePillar, datasets } = props;
    return (
        <>
            {activePillar.questions.map(x => (
                <Question key={x.labelShort} question={x} dataset={datasets[x.sheet]} />
            ))}
        </>
    );
};

export default Questions;
