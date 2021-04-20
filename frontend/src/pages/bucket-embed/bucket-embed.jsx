import axios from "axios";
import React from "react";
import Goal from "../../components/goal/goal";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
    KEY_STATS_URL,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { parseSheetDate } from "../../modules/utils";
import styles from "./bucket-embed.module.scss";

const usePillarData = (pillarSlug, bucketSlug) => {
    const [pillars, setPillars] = React.useState(null);
    const [keyStats, setKeyStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [goalDatasets, setGoalDatasets] = React.useState(null);

    React.useEffect(() => {
        Promise.all([
            axios(PILLAR_URL)
                .then(res => parseMetaSheet(res.data))
                .then(setPillars),

            axios(KEY_STATS_URL)
                .then(res => res.data)
                .then(setKeyStats),
        ]);
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    const commonPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug === "common");
    }, [pillars]);

    React.useEffect(() => {
        if (!pillar || !commonPillar) return;
        let newGoalData = {};

        const goal = bucketSlug ? pillar.goals.find(d => d.slug === bucketSlug) : pillar.goals[0];
        if (!goal) return console.error(`Missing bucket "${bucketSlug}"`);

        const commonPillarSheets = commonPillar.goals.map(g => g.sheet);

        const sheets = [goal?.sheet, ...commonPillarSheets].filter(Boolean);

        Promise.all(
            sheets.map(sheet =>
                axios(
                    USE_SHEET
                        ? `${DATA_SHEET_URL}?range=${sheet}`
                        : `${STATIC_DATA_BASE_URL}/${sheet}.json`
                )
                    .then(d => d.data)
                    .then(data =>
                        data.map(d => ({
                            ...d,
                            Year: parseSheetDate(d.Year),
                        }))
                    )
                    .then(d => (newGoalData[sheet] = d))
            )
        )
            .then(() => setGoalDatasets(newGoalData))
            .then(() => setLoading(false));
    }, [pillar, bucketSlug, commonPillar]);

    const keyStatsPerPillar = React.useMemo(() => {
        if (!pillar || !keyStats) return null;
        return keyStats.filter(s => s["Pillar Slug"] === pillar.slug);
    }, [pillar, keyStats]);

    return {
        pillar,
        pillarLoading: loading,
        goalDatasets,
        keyStats: keyStatsPerPillar,
        commonPillar,
    };
};

export default function BucketEmbed(props) {
    const { pillarSlug, bucketSlug, countryCode } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, goalDatasets, keyStats, commonPillar } = pillarData;

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    return (
        <div className={styles.bucketEmbed}>
            {!pillarData.loading && (
                <Goal
                    key={goal.label}
                    goal={goal}
                    pillar={pillar}
                    goalDatasets={goalDatasets}
                    goalData={goalDatasets && goalDatasets[goal.sheet]}
                    pillarLoading={pillarData.loading}
                    countryCode={countryCode}
                    keyStats={keyStats}
                    commonPillar={commonPillar}
                />
            )}
        </div>
    );
}