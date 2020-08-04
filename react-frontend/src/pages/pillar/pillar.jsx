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
import styles from "./pillar.module.scss";
import TempPillarAllData from "./temp-pillar-all-data.svg";
import TempPillarExplore from "./temp-pillar-explore.svg";
import TempPillarIcon from "./temp-pillar-icon.svg";
import TempPillarNews from "./temp-pillar-news.png";
import TempPillarOtherTracking from "./temp-pillar-other-tracking.svg";
import TempPillarPartnership from "./temp-pillar-partnerships.svg";

const usePillarData = () => {
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
        return pillars[2]; // TODO: pass in prop
    }, [pillars]);

    React.useEffect(() => {
        if (!pillar) return;
        let newGoalData = {};
        const sheets = Object.values(pillar.goals).map(goal => goal.sheet);
        Promise.all(
            sheets.map(sheet =>
                axios(
                    USE_SHEET
                        ? `${DATA_SHEET_URL}?range=${sheet}`
                        : `${STATIC_DATA_BASE_URL}/${sheet}.json`
                )
                    .then(d => d.data)
                    .then(d => (newGoalData[sheet] = d))
            )
        )
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

export default function Pillar(props) {
    const pillarData = usePillarData();
    // TODO: pillar must be global state.
    // TODO: remove "regionLookup"?
    const { pillar, regionLookup, goalDatasets } = pillarData;

    if (!pillar) return null; // TODO loader

    return (
        <div>
            <div className={styles.pillarHeading}>
                <h5>
                    <strong>Our Response</strong> - {pillar.labelLong}
                </h5>
                <div className={styles.pillarHeadingMain}>
                    <img src={TempPillarIcon} alt={pillar.tagline} />
                    <h1>{pillar.labelLong}</h1>
                    <p>
                        <strong>{pillar.tagline}</strong>
                        <br />
                        <br />
                        {pillar.description}
                    </p>
                </div>
            </div>
            <div className={styles.pillarExplore}>
                <img src={TempPillarExplore} alt="Explore" />
            </div>
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
            <div className={styles.tempGoalHeader}>
                <h2>Other things countries are tracking</h2>
            </div>
            <div className={styles.tempOtherTracking}>
                <img src={TempPillarOtherTracking} alt="Other things countries are tracking" />
            </div>
            <div className={styles.tempAllData}>
                <img src={TempPillarAllData} alt="All Data" />
            </div>
            <div className={styles.tempNews}>
                <img src={TempPillarNews} alt="News" />
            </div>
            <div className={styles.tempPartnership}>
                <img src={TempPillarPartnership} alt="Partnerships" />
            </div>
        </div>
    );
}
