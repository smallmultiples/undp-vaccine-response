import axios from "axios";
import { differenceInDays } from "date-fns";
import React from "react";
import Goal from "../../components/goal/goal";
import { DATA_SHEET_URL, PILLAR_URL, KEY_STATS_URL, SOURCES_URL } from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { parseSheetDate } from "../../modules/utils";
import styles from "./bucket-embed.module.scss";

const usePillarData = (pillarSlug, bucketSlug) => {
    const [pillars, setPillars] = React.useState(null);
    const [keyStats, setKeyStats] = React.useState(null);
    const [sourcesData, setSourcesData] = React.useState(null);
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

            axios(SOURCES_URL)
                .then(res => res.data)
                .then(setSourcesData),
        ]);
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        if (!pillarSlug) return pillars.filter(d => d.visible)[0];
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
                axios(`${DATA_SHEET_URL}?range=${sheet}`)
                    .then(d => d.data)
                    .then(data =>
                        data.map(d => ({
                            ...d,
                            Year: parseSheetDate("1/1/2021 00:00"),
                            first_vaccine_date: parseSheetDate(d.first_vaccine_date)
                                ? differenceInDays(new Date(), parseSheetDate(d.first_vaccine_date))
                                : null,
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
        sourcesData,
    };
};

export default function BucketEmbed(props) {
    const { pillarSlug, bucketSlug, countryCode } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, goalDatasets, keyStats, commonPillar, sourcesData } = pillarData;

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
                    sourcesData={sourcesData}
                />
            )}
        </div>
    );
}
