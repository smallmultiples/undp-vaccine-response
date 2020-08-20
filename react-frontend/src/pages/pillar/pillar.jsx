import axios from "axios";
import React from "react";
import Goal from "../../components/goal/goal";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    REGIONS_URL,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
    KEY_STATS_URL,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import styles from "./pillar.module.scss";
import TempPillarAllData from "./temp-pillar-all-data.svg";
import TempPillarIcon from "./temp-pillar-icon.svg";
import TempPillarNews from "./temp-pillar-news.png";
import TempPillarOtherTracking from "./temp-pillar-other-tracking.svg";
import TempPillarPartnership from "./temp-pillar-partnerships.svg";
import { parseSheetDate } from "../../modules/utils";
import { useParams } from "react-router-dom";
import { MapBlockVis, formatManualValue, ManualBlockVis } from "../../components/goal/block-visualisation";

const usePillarData = pillarSlug => {
    const [pillars, setPillars] = React.useState(null);
    const [regionLookup, setRegionLookup] = React.useState(null);
    const [keyStats, setKeyStats] = React.useState(null);
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

            axios(KEY_STATS_URL)
                .then(res => res.data)
                .then(setKeyStats),
        ]);
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    const keyStatsPerPillar = React.useMemo(() => {
        if (!pillar || !keyStats) return null;
        return keyStats.filter(s => s["Pillar Slug"] === pillar.slug);
    }, [pillar, keyStats]);

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
    }, [pillar]);

    return {
        pillar,
        pillarLoading: loading,
        goalDatasets,
        regionLookup,
        keyStats: keyStatsPerPillar,
    };
};

export default function Pillar(props) {
    const params = useParams();
    const { pillarSlug } = params;

    const pillarData = usePillarData(pillarSlug);
    // TODO: pillar must be global state.
    // TODO: remove "regionLookup"?
    const { pillar, regionLookup, goalDatasets, keyStats } = pillarData;

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
                {keyStats
                    .filter(s => s["Bucket"] === 0 && s["Chart type"] !== "")
                    .map((s, i) => {
                        if (s["Indicator"] === "Manual entry") {
                            return (
                                <ManualBlockVis
                                    type={s["Chart type"]}
                                    key={`manual-chart-${i}`}
                                    configuration={s["Configuration"]}
                                    manualEntry={{
                                        value: formatManualValue(s["Stat A value"], s["Stat A type"]),
                                        secondaryLabel: s["Stat A label"],
                                    }}
                                />
                            );
                        }
                        let ind;
                        pillar.goals.some(goal => {
                            const indic = goal.indicators.find(
                                indd => {
                                    return indd.dataKey === s["Indicator"].split(";")[0];
                                }
                            );
                            if (indic) {
                                ind = indic;
                                return true;
                            } else {
                                return false;
                            }
                        })
                        if (!ind) return null;
                        return (
                            <MapBlockVis
                                indicator={ind}
                                type={s["Chart type"]}
                                configuration={s["Configuration"]}
                                key={ind.label}
                                // {...blockProps}
                            />
                        );
                    })}
            </div>
            {!pillarData.loading &&
                pillar.goals.map(goal => (
                    <Goal
                        key={goal.label}
                        goal={goal}
                        pillar={pillar}
                        keyStats={keyStats}
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
