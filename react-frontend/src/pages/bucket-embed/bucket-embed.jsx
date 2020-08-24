import axios from "axios";
import React from "react";
import Goal from "../../components/goal/goal";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { parseSheetDate } from "../../modules/utils";

// TODO: de-duplicate this logic from "pillar" page.
const usePillarData = (pillarSlug, bucketSlug) => {
    const [pillars, setPillars] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [goalDatasets, setGoalDatasets] = React.useState(null);

    React.useEffect(() => {
        axios(PILLAR_URL)
            .then(res => parseMetaSheet(res.data))
            .then(setPillars);
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    React.useEffect(() => {
        if (!pillar) return;
        let newGoalData = {};

        const goal = pillar.goals.find(d => d.slug === bucketSlug);
        if (!goal) return console.error(`Missing bucket "${bucketSlug}"`);
        const sheet = goal.sheet;

        axios(
            USE_SHEET ? `${DATA_SHEET_URL}?range=${sheet}` : `${STATIC_DATA_BASE_URL}/${sheet}.json`
        )
            .then(d => d.data)
            .then(data =>
                data.map(d => ({
                    ...d,
                    Year: parseSheetDate(d.Year),
                }))
            )
            .then(d => (newGoalData[sheet] = d))
            .then(() => setGoalDatasets(newGoalData))
            .then(() => setLoading(false));
    }, [pillar, bucketSlug]);

    return {
        pillar,
        pillarLoading: loading,
        goalDatasets,
    };
};

export default function BucketEmbed(props) {
    const { pillarSlug, bucketSlug, countryCode } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, goalDatasets } = pillarData;

    const missingBucket = React.useMemo(() => {
        return !Boolean(bucketSlug);
    }, [bucketSlug]);

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    return (
        <div>
            {!pillarData.loading && (
                <Goal
                    key={goal.label}
                    goal={goal}
                    pillar={pillar}
                    goalDatasets={goalDatasets}
                    goalData={goalDatasets && goalDatasets[goal.sheet]}
                    pillarLoading={pillarData.loading}
                    missingBucket={missingBucket}
                    countryCode={countryCode}
                />
            )}
        </div>
    );
}
