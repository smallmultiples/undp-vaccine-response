import React from "react";
import styles from "./questions.module.scss";
import Table from "./table";
import { Chevron } from "../icons/icons";
import Badge from "./badge";
import Chart from "./chart";
import useMediaQuery from "../../hooks/use-media-query";
import { flatten } from "lodash";

const COUNTRIES_TOTAL = 249;

const Question = props => {
    const { question, dataset, countryData, hdiIndicator, covidPillar } = props;
    const [isPreviewShown, setIsPreviewShown] = React.useState(false);
    const { isMobile } = useMediaQuery();

    if (question.comingSoon) return null;

    const covidIndicators = flatten(covidPillar.questions.map(d => d.indicators));

    const headers = ["Country", "Region"];

    const rowsForOverviewTable = question.indicators.map(ind => {
        const label = ind.tableLabel || ind.label;
        const countryCount = ind.meta ? ind.meta.countryCount : "";

        const cc = (
            <div className={styles.countryCount}>
                {!isMobile && <Badge percentage={(countryCount * 100) / COUNTRIES_TOTAL} />}
                <div
                    className={styles.label}
                >{`${countryCount} / ${COUNTRIES_TOTAL} countries and areas`}</div>
            </div>
        );

        const currency = ind.meta ? ind.meta.currency : "";
        const sources = (
            <div>
                {ind.meta?.sources.map((s, i) => {
                    return (
                        <span key={`link_${i}`}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer">
                                {s.name}
                            </a>
                            {i < ind.meta.sources.length - 1 && ", "}
                        </span>
                    );
                })}
            </div>
        );
        headers.push(label);
        return [label, cc, currency, sources];
    });

    const headersForCountryTable = headers.concat(
        covidIndicators.map(d => d.tableLabel || d.label)
    );

    const rowsForCountryTable = dataset?.slice(0, 5).map(x => {
        const country = countryData && countryData[x["Alpha-3 code"]];
        const arr = [x["Country or Area"], (country && country["Region Name"]) || ""];
        question.indicators.forEach(ind => {
            arr.push(ind.format(x[ind.dataKey]));
        });

        if (country) {
            covidIndicators.forEach(ind => {
                arr.push(ind.format(country[ind.dataKey]));
            });
        }
        return arr;
    });

    const chartData = question.indicators
        .map(ind => {
            const tmp = [];
            for (const d of dataset || []) {
                tmp.push({
                    country: d["Country or Area"],
                    data: d[ind.dataKey],
                    hdi: countryData && countryData[d["Alpha-3 code"]][hdiIndicator?.dataKey],
                });
            }
            const isNumericData = tmp.every(t => typeof t.data === "number" || t.data === "");
            if (tmp.length > 0 && isNumericData) {
                return {
                    indicator: ind,
                    data: tmp.filter(d => d.data !== ""),
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
                    <p
                        className={styles.description}
                        dangerouslySetInnerHTML={{ __html: question.description }}
                    />
                </div>
                <div className={styles.chartsContainer}>
                    {chartData.length > 0 && <Legend hdiIndicator={hdiIndicator} />}
                    {chartData &&
                        chartData.map((x, i) => {
                            return (
                                <Chart
                                    key={`${x.indicator}_${i}`}
                                    indicator={x.indicator}
                                    data={x.data}
                                />
                            );
                        })}
                </div>
                <div className={styles.overviewTable}>
                    <h3>Source information</h3>
                    <Table
                        headings={["Indicators", "Availability", "Currency", "Data source"]}
                        rows={rowsForOverviewTable}
                        fixedColumns={isMobile ? 0 : 2}
                        fixedColumnsWidth={30}
                    />
                    <button className={styles.downloadButton}>Download CSV</button>
                    {!isMobile && (
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
                    )}
                </div>
                {!isMobile && (
                    <div className={styles.countryTable} data-visible={isPreviewShown}>
                        <Table
                            headings={headersForCountryTable}
                            rows={rowsForCountryTable || []}
                            fixedColumns={2}
                            fixedColumnsWidth={15}
                            withBorders={true}
                            footer={
                                <div className={styles.summary}>
                                    <div>{`${COUNTRIES_TOTAL - 5} more rows`}</div>
                                    <button className={styles.downloadButton}>Download CSV</button>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
};

const Legend = props => {
    return (
        <div className={styles.legendContainer}>
            <div className={styles.legendTitle}>Human Development Group</div>
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
    const { activePillar, datasets, countryData, hdiIndicator, covidPillar } = props;
    return (
        <>
            <h2 className={styles.questionsHeading}>Explore indicators for {activePillar.label}</h2>
            {activePillar.questions.map((x, i) => (
                <Question
                    key={`${x.labelLong}_${i}`}
                    question={x}
                    dataset={datasets[x.sheet]}
                    countryData={countryData}
                    hdiIndicator={hdiIndicator}
                    covidPillar={covidPillar}
                />
            ))}
        </>
    );
};

export default Questions;
