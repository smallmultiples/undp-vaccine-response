import axios from "axios";
import React from "react";
import Goal from "../../components/goal/goal";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    REGIONS_URL,
    USE_SHEET,
    STATIC_DATA_BASE_URL,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import styles from "./pillar.module.scss";

const usePillarData = () => {
    const [pillars, setPillars] = React.useState(null);
    const [regionLookup, setRegionLookup] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [pillarData, setPillarData] = React.useState(null);

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
        return pillars[2]; // TODO
    }, [pillars]);

    React.useEffect(() => {
        if (!pillar) return;
        if (USE_SHEET) {
            axios(`${DATA_SHEET_URL}?range=${pillar.sheet}`)
                .then(d => d.data)
                .then(setPillarData)
                .then(() => setLoading(false));
        } else {
            axios(`${STATIC_DATA_BASE_URL}/${pillar.sheet}.json`)
                .then(d => d.data)
                .then(setPillarData)
                .then(() => setLoading(false));
        }
    }, [pillar]);

    // TODO: remove "pillars".
    // TODO: remove special "covid" sheet.

    return {
        pillar,
        loading,
        pillars,
        regionLookup,
        data: pillarData,
    };
};

export default function Pillar(props) {
    const pillarData = usePillarData();
    // TODO: pillar must be global state.
    const { pillar, data, regionLookup, loading } = pillarData;

    console.log({ data, regionLookup, loading });

    if (!pillar) return null; // TODO loader

    return (
        <div>
            <div className={styles.pillarHeading}>
                <h5>
                    <strong>Our Response</strong> - {pillar.labelLong}
                </h5>
                <div className={styles.pillarHeadingMain}>
                    <h1>{pillar.labelLong}</h1>
                    <p>
                        <strong>{pillar.tagline}</strong>
                        <br />
                        <br />
                        {pillar.description}
                    </p>
                </div>
            </div>
            {pillar.goals.map(goal => (
                <Goal key={goal.label} goal={goal} pillar={pillar} pillarData={pillarData} />
            ))}
        </div>
    );
}
