import React from "react";
import styles from "./questions.module.scss";
import Table from "./table";
import { Chevron } from "../icons/icons";

const Question = props => {
    const { question } = props;
    const [isPreviewShown, setIsPreviewShown] = React.useState(true);
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
                    rows={[
                        ["one", "two", "three", "four"],
                        ["one", "two", "three", "four"],
                    ]}
                    fixedColumns={1}
                    fixedColumnsWidth={40}
                />
            </div>
            <div className={styles.countryTable} data-visible={isPreviewShown}>
                <Table
                    headings={[
                        "Country",
                        "Region",
                        "Number of hospital beds per 1,000 people",
                        "Physicians per 1,000 people",
                    ]}
                    rows={[
                        ["one", "two", "three", "four"],
                        ["one", "two", "three", "four"],
                    ]}
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
    const { activePillar } = props;
    console.log(activePillar);

    return (
        <>
            {activePillar.questions.map(x => (
                <Question key={x.key} question={x} />
            ))}
        </>
    );
};

export default Questions;
