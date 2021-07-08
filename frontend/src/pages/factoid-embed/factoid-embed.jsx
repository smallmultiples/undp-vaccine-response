import axios from "axios";
import { differenceInDays } from "date-fns";
import React from "react";
import Factoid from "../../components/factoid/factoid";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    KEY_STATS_URL,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { parseSheetDate } from "../../modules/utils";
import styles from "./factoid-embed.module.scss";

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
                axios(`${DATA_SHEET_URL}?range=${sheet}`
                )
                    .then(d => d.data)
                    .then(data =>
                        data.map(d => ({
                            ...d,
                            Year: parseSheetDate(d.Datetime),
                            FIRST_VACCINE_DATE: parseSheetDate(d.FIRST_VACCINE_DATE) ? differenceInDays(new Date(), parseSheetDate(d.FIRST_VACCINE_DATE)) : null,
                            AUTHORIZATION_DATE: parseSheetDate(d.AUTHORIZATION_DATE) ? differenceInDays(new Date(), parseSheetDate(d.AUTHORIZATION_DATE)) : null,
                            START_DATE: parseSheetDate(d.START_DATE) ? differenceInDays(new Date(), parseSheetDate(d.START_DATE)) : null,
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

export default function FactoidEmbed(props) {
    const { pillarSlug, bucketSlug, factoidNumber } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, goalDatasets, keyStats } = pillarData;

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    return (
        <div className={styles.bucketEmbed}>
            {!pillarData.loading && (
                <Factoid
                    key={goal.label}
                    goal={goal}
                    goalDatasets={goalDatasets}
                    keyStats={keyStats}
                    factoidNumber={factoidNumber}
                />
            )}
        </div>
    );
}
