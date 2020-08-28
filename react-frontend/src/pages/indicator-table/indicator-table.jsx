import axios from "axios";
import React from "react";
import { PILLAR_URL } from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import styles from "./indicator-table.module.scss";
import Table from "../../components/questions/table";
import regionsLookup from "../../modules/data/region-lookup.json";
const COUNTRIES_TOTAL = regionsLookup.length;

const usePillarData = pillarSlug => {
    const [pillars, setPillars] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios(PILLAR_URL)
            .then(res => parseMetaSheet(res.data))
            .then(setPillars)
            .then(() => setLoading(false));
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    return {
        pillar,
        pillarLoading: loading,
    };
};

export default function IndicatorTable(props) {
    const { pillarSlug, bucketSlug } = props;
    const { pillar } = usePillarData(pillarSlug, bucketSlug);

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    const rowsForOverviewTable = goal.indicators.map(ind => {
        const label = ind.tableLabel || ind.label;
        const countryCount = ind.meta ? ind.meta.countryCount : "";

        const cc = (
            <div className={styles.countryCount}>
                <div
                    className={styles.label}
                >{`${countryCount} / ${COUNTRIES_TOTAL} countries`}</div>
            </div>
        );

        const currency = ind.meta ? ind.meta.lastUpdated : "";

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

        const quality = ind.meta ? ind.meta.quality : "";
        return [label, cc, currency, sources, quality];
    });

    return (
        <div className={styles.indicatorTable}>
            <Table
                headings={["Data", "Coverage", "Currency", "Data source", "Quality"]}
                rows={rowsForOverviewTable}
                fixedColumns={2}
                fixedColumnsWidth={30}
            />
        </div>
    );
}
