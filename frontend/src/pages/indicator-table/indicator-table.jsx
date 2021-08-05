import axios from "axios";
import React, { useState } from "react";
import { DATA_SHEET_URL } from "../../config/constants";
import styles from "./indicator-table.module.scss";
import Table from "../../components/questions/table";
import { getIndicatorDataKey, parseSheetDate, saveBlob } from "../../modules/utils";
import { csvFormat } from "d3";
import usePillarData from "../../hooks/use-pillar-data";

async function downloadIndicators(goalLabel, sheet, allIndicators) {
    const res = await axios(`${DATA_SHEET_URL}?range=${sheet}`);

    const indicatorData = res.data.map(d => {
        const tmp = {};
        allIndicators.forEach(x => {
            const dataKey = getIndicatorDataKey(x);
            tmp[dataKey] = d[dataKey];
        });
        return {
            iso: d["iso3"],
            ...tmp,
        };
    });

    const csv = csvFormat(indicatorData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    saveBlob(`${goalLabel}_data.csv`, blob);
}

async function downloadMetaData(goalLabel, allIndicators, sourcesData) {
    const metaData = allIndicators
        .filter(d => d.meta)
        .map(ind => {
            const label = ind.tableLabel || ind.label;
            const sources = ind.meta?.sources.map((s, i) => {
                const sourceMetaData = sourcesData?.find(x => x["Data source name"] === s.name);
                let lastUpdated = "";
                if (sourceMetaData) {
                    if (
                        sourceMetaData["Last updated start"] &&
                        sourceMetaData["Last updated end"]
                    ) {
                        lastUpdated =
                            sourceMetaData["Last updated start"] +
                            " - " +
                            sourceMetaData["Last updated end"];
                    } else {
                        lastUpdated = sourceMetaData["Last updated start"];
                    }
                }

                return {
                    name: s.name,
                    lastUpdated,
                    link: s.url,
                };
            });

            const sourcesObj = {};
            sources.forEach((x, i) => {
                sourcesObj[`Source #${i + 1} name`] = x.name;
                sourcesObj[`Source #${i + 1} date last updated`] = x.lastUpdated;
                sourcesObj[`Source #${i + 1} link`] = x.link;
            });

            return { label, ...sourcesObj };
        });

    const csv = csvFormat(metaData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    saveBlob(`${goalLabel}_meta_data.csv`, blob);
}

function IconDownload(props) {
    return (
        <svg
            width="14"
            height="15"
            viewBox="0 0 14 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M5.90625 0.748047C5.52344 0.748047 5.25 1.04883 5.25 1.4043V5.99805H2.84375C2.35156 5.99805 2.10547 6.59961 2.46094 6.95508L6.61719 11.1113C6.80859 11.3027 7.16406 11.3027 7.35547 11.1113L11.5117 6.95508C11.8672 6.59961 11.6211 5.99805 11.1289 5.99805H8.75V1.4043C8.75 1.04883 8.44922 0.748047 8.09375 0.748047H5.90625ZM14 11.0293C14 10.6738 13.6992 10.373 13.3438 10.373H9.32422L7.98438 11.7129C7.4375 12.2871 6.53516 12.2871 5.98828 11.7129L4.64844 10.373H0.65625C0.273438 10.373 0 10.6738 0 11.0293V14.0918C0 14.4746 0.273438 14.748 0.65625 14.748H13.3438C13.6992 14.748 14 14.4746 14 14.0918V11.0293ZM10.6094 13.4355C10.6094 13.7363 10.3633 13.9824 10.0625 13.9824C9.76172 13.9824 9.51562 13.7363 9.51562 13.4355C9.51562 13.1348 9.76172 12.8887 10.0625 12.8887C10.3633 12.8887 10.6094 13.1348 10.6094 13.4355ZM12.3594 13.4355C12.3594 13.7363 12.1133 13.9824 11.8125 13.9824C11.5117 13.9824 11.2656 13.7363 11.2656 13.4355C11.2656 13.1348 11.5117 12.8887 11.8125 12.8887C12.1133 12.8887 12.3594 13.1348 12.3594 13.4355Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default function IndicatorTable(props) {
    const { pillarSlug, bucketSlug } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, sourcesData, commonPillar } = pillarData;
    const [showMetaData, setShowMetaData] = useState(false);

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    const allIndicators = goal.indicators.concat(commonPillar?.goals[0].indicators);

    const rowsForOverviewTable = allIndicators
        .filter(d => d.meta)
        .map(ind => {
            const label = ind.tableLabel || ind.label;

            const lastUpdated = (
                <div>
                    {ind.meta?.sources.map((s, i) => {
                        const sourceMetaData = sourcesData?.find(
                            x => x["Data source name"] === s.name
                        );

                        return (
                            <span key={`link_${i}`}>
                                {sourceMetaData && sourceMetaData["Last updated start"]}
                                {sourceMetaData &&
                                    sourceMetaData["Last updated end"] &&
                                    ` - ${sourceMetaData["Last updated end"]}`}
                                {i < ind.meta.sources.length - 1 && ", "}
                            </span>
                        );
                    })}
                </div>
            );

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

            return [label, lastUpdated, sources];
        });

    return (
        <div className={styles.indicatorTable}>
            <div className={styles.buttonRow}>
                <div
                    className={styles.downloadButton}
                    onClick={() =>
                        downloadIndicators(goal.label, goal.indicators[0].goal.sheet, allIndicators)
                    }
                >
                    Download data <IconDownload />
                </div>
                <div
                    className={styles.showHideButton}
                    onClick={() => setShowMetaData(!showMetaData)}
                >
                    {showMetaData ? `Hide meta data` : `Show meta data`}
                </div>
                <div
                    className={styles.downloadLink}
                    onClick={() => downloadMetaData(goal.label, allIndicators, sourcesData)}
                >
                    Download meta data
                </div>
            </div>
            <div
                style={{
                    maxHeight: showMetaData ? rowsForOverviewTable.length * 45 + 150 : 0,
                    transition: "all 0.5s ease-in-out",
                    overflow: "hidden",
                }}
            >
                <Table
                    headings={["Data", "Last updated", "Data source", ""]}
                    rows={rowsForOverviewTable}
                    fixedColumns={3}
                    fixedColumnsWidth={33}
                />
            </div>
        </div>
    );
}
