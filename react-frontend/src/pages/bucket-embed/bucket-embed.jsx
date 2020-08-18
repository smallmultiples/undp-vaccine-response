import axios from "axios";
import React from "react";
import Goal from "../../components/goal/goal";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    REGIONS_URL,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { parseSheetDate } from "../../modules/utils";
import { useParams } from "react-router-dom";

// TODO: de-duplicate this logic from "pillar" page.
const usePillarData = (pillarSlug, bucketIndex) => {
    const [pillars, setPillars] = React.useState(null);
    const [regionLookup, setRegionLookup] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [goalDatasets, setGoalDatasets] = React.useState(null);

    React.useEffect(() => {
        Promise.all([
            axios(PILLAR_URL)
                .then(res => parseMetaSheet(res.data))
                .then(setPillars),

            axios(REGIONS_URL)
                .then(res => res.data)
                .then(setRegionLookup),
        ]);
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    React.useEffect(() => {
        if (!pillar) return;
        let newGoalData = {};

        const sheet = pillar.goals[bucketIndex].sheet;

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
    }, [pillar]);

    return {
        pillar,
        pillarLoading: loading,
        goalDatasets,
        regionLookup,
    };
};

export default function BucketEmbed(props) {
    const params = useParams();
    const pillarSlug = props.pillarSlug || params.pillarSlug;
    const bucketIndex = props.bucketIndex || params.bucketIndex;
    const pillarData = usePillarData(pillarSlug, bucketIndex);
    const { pillar, regionLookup, goalDatasets } = pillarData;

    if (!pillar) return null; // TODO loader

    return (
        <div>
            asd
            {!pillarData.loading &&
                pillar.goals.map(goal => (
                    <Goal
                        key={goal.label}
                        goal={goal}
                        pillar={pillar}
                        regionLookup={regionLookup}
                        goalDatasets={goalDatasets}
                        goalData={goalDatasets && goalDatasets[goal.sheet]}
                        pillarLoading={pillarData.loading}
                    />
                ))}
        </div>
    );
}
