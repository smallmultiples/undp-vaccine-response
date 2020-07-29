import axios from "axios";
import { flatten, uniq } from "lodash";
import React from "react";
import Map from "../../components/map/map";
import Pillars from "../../components/pillars/pillars";
import Questions from "../../components/questions/questions";
import {
    DATA_SHEET_URL,
    PILLAR_URL,
    REGIONS_URL,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
} from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import { isMapOnly } from "../../modules/is-map-only";
import styles from "./pillar.module.scss";

const usePillarData = () => {
    const [pillars, setPillars] = React.useState(null);
    const [regionLookup, setRegionLookup] = React.useState(null);
    const [datasets, setDatasets] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const pillars = await axios(PILLAR_URL).then(d => parseMetaSheet(d.data));
            setPillars(pillars);

            const regionsPromise = axios(REGIONS_URL)
                .then(d => d.data)
                .then(setRegionLookup);

            let newSets = {};

            if (USE_SHEET) {
                const sheetsToFetch = uniq(pillars.map(p => p.sheet).filter(Boolean));

                await Promise.all(
                    sheetsToFetch.map(async sheet => {
                        const res = await axios(`${DATA_SHEET_URL}?range=${sheet}`);
                        newSets[sheet] = res.data;
                    })
                );
            } else {
                newSets = await axios(`${STATIC_DATA_BASE_URL}/datasets.json`).then(d => d.data);
            }
            await regionsPromise;

            setDatasets(newSets);
            setLoading(false);
        })();
    }, []);

    // Countrydata is just a merge of all the datasets
    const countryData = React.useMemo(() => {
        if (loading) return null;

        let data = {};
        Object.values(regionLookup).forEach(region => {
            data[region["ISO-alpha3 Code"]] = region;
        });
        Object.values(datasets).forEach(dataset => {
            dataset.forEach(row => {
                const rowKey = row["Alpha-3 code"];
                data[rowKey] = data[rowKey] || {};

                Object.entries(row).forEach(([key, value]) => {
                    data[rowKey][key] = value;
                });
            });
        });
        return data;
    }, [datasets, loading, regionLookup]);

    return {
        countryData,
        loading,
        datasets,
        pillars,
    };
};

export default function Pillar(props) {
    const { pillars, datasets, countryData, loading } = usePillarData();
    const [activeQuestion, setActiveQuestion] = React.useState(null);

    React.useEffect(() => {
        if (activeQuestion || !pillars) return;
        const goals = flatten(pillars.filter(d => d.visible).map(p => p.goals));
        setActiveQuestion(goals[0]);
    }, [pillars, activeQuestion]);

    const covidPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(d => d.covid);
    }, [pillars]);

    const lastUpdatedDate = React.useMemo(() => {
        if (!covidPillar) return undefined;
        return new Date(
            covidPillar.goals[0].indicators[0].meta.updateFrequency.replace("Last updated ", "") +
                " GMT+1000"
        );
    }, [covidPillar]);

    const activePillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(pillar => pillar.goals.some(q => q === activeQuestion));
    }, [activeQuestion, pillars]);

    const hdiIndicator = React.useMemo(() => {
        if (!pillars) return null;
        const indicators = flatten(pillars.map(p => flatten(p.goals.map(q => q.indicators))));
        return indicators.find(d => d.hdi);
    }, [pillars]);

    if (!pillars || !activePillar || !activeQuestion) return null; // TODO loader

    const dateTimeFormat = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
    const date = dateTimeFormat.format(lastUpdatedDate);

    return (
        <React.Fragment>
            <Map
                countryData={countryData}
                countryDataLoading={loading}
                activePillar={activePillar}
                covidPillar={covidPillar}
                pillars={pillars}
                activeQuestion={activeQuestion}
            />
            {!isMapOnly && (
                <Questions
                    activePillar={activePillar}
                    covidPillar={covidPillar}
                    datasets={datasets}
                    countryData={countryData}
                    hdiIndicator={hdiIndicator}
                />
            )}
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <div className={styles.subHeadings}>
                <span className={styles.updateDate}>
                    Data last updated <em>{date}</em>
                </span>
            </div>
        </React.Fragment>
    );
}
