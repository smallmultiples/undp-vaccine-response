import React from "react";
import Map from "./components/map/map";
import axios from "axios";
import styles from "./root.module.scss";
import Header from "./components/header/header";
import Pillars from "./components/pillars/pillars";
import Questions from "./components/questions/questions";
import DataFilters from "./components/data-filters/data-filters";
import { flatten, uniq, last } from "lodash";
import Footer from "./components/footer/footer";
import { formats } from "./modules/format";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "1o8FVEy59M0k8XHRm3TvCNpt-MQ8V_e0TaqqOGe7N1tQ";

const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

const parseMetaSheet = raw => {
    const out = {};
    let currentPillar = null;
    let currentQuestion = null;
    for (let row of raw) {
        // Pillar

        if (row.col0) {
            currentPillar = last(row.col0.split(" "));
            out[currentPillar] = {
                label: currentPillar,
                labelLong: row["Pillar long"],
                tagline: row["Pillar tagline"],
                description: row["Pillar Description"],
                questions: {},
                visible: currentPillar !== "ALL",
                covid: currentPillar === "ALL",
            };
        }
        // -----------

        // Question
        const qs = row["Question short"];
        if (qs) {
            currentQuestion = qs;
            out[currentPillar].questions[qs] = {
                labelShort: qs,
                label: row["Question"],
                sheet: row["Sheet"],
                indicators: {},
                hidden: qs === "-",
            };
        }
        // ------------

        // Indicator
        const ind = row["Indicator"];
        if (ind) {
            let meta = null;
            if (
                row["Time period"] ||
                row["Data source name"] ||
                row["Data source link"] ||
                row["Number of Countries"]
            ) {
                const names = row["Data source name"].split(";").map(d => d.trim());
                const urls = row["Data source link"].split(";").map(d => d.trim());
                const sources = names.map((name, i) => {
                    return {
                        name,
                        url: urls[i],
                    };
                });
                const countryCount = row["Number of Countries"];
                meta = {
                    currency: row["Time period"],
                    sources,
                    countryCount,
                };
            } else {
                const lastQuestionIndicator = last(
                    out[currentPillar].questions[currentQuestion].indicators
                );
                if (lastQuestionIndicator) {
                    // Copy the previous meta
                    meta = lastQuestionIndicator.meta;
                }
            }
            out[currentPillar].questions[currentQuestion].indicators[ind] = {
                label: ind,
                dataKey: row["Data Key"],
                tooltipKey: row["Tooltip Key"],
                flipped: row["Invert Scale"],
                format: formats[row["Data Format"]](row["Decimal Places"]),
                meta,
            };
        }

        // ---------
    }

    const asArrays = Object.values(out).map(pillar => {
        const questions = Object.values(pillar.questions).map(question => {
            const indicators = Object.values(question.indicators);
            return {
                ...question,
                indicators,
            };
        });

        return {
            ...pillar,
            questions,
        };
    });

    return asArrays;
};

const usePillarData = () => {
    const [pillars, setPillars] = React.useState(null);
    const [regionLookup, setRegionLookup] = React.useState(null);
    const [datasets, setDatasets] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const regions = await axios(
                `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=regions!D:K`
            ).then(d => d.data);
            setRegionLookup(regions);
        })();
    }, []);

    React.useEffect(() => {
        (async () => {
            const pillars = await axios(
                `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=indicators`
            ).then(d => parseMetaSheet(d.data));
            setPillars(pillars);

            const sheetsToFetch = uniq(
                flatten(pillars.map(p => p.questions.map(q => q.sheet))).filter(Boolean)
            );

            let newSets = {};
            await Promise.all(
                sheetsToFetch.map(async sheet => {
                    const res = await axios(
                        `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=${sheet}`
                    );
                    newSets[sheet] = res.data;
                })
            );

            setDatasets(newSets);
            setLoading(false);
        })();
    }, []);

    // Countrydata is just a merge of all the datasets
    const countryData = React.useMemo(() => {
        if (loading) return null;

        let data = {};
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
    }, [datasets, loading]);

    return {
        countryData,
        loading,
        datasets,
        pillars,
        regionLookup,
    };
};

function App() {
    const { pillars, regionLookup, datasets, countryData, loading } = usePillarData();
    const [activePillar, setActivePillar] = React.useState(null);

    React.useEffect(() => {
        if (activePillar || !pillars) return;
        setActivePillar(pillars.find(d => d.visible));
    }, [pillars, activePillar]);

    const covidPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(d => d.covid);
    }, [pillars]);

    if (!pillars || !activePillar || !regionLookup) return null; // TODO loader

    return (
        <div className={styles.root}>
            <Header />
            <div className={styles.container}>
                <Pillars
                    activePillar={activePillar}
                    covidPillar={covidPillar}
                    setActivePillar={setActivePillar}
                    pillars={pillars}
                />
                <Map
                    countryData={countryData}
                    countryDataLoading={loading}
                    activePillar={activePillar}
                    covidPillar={covidPillar}
                    pillars={pillars}
                />
                <DataFilters />
                <Questions
                    activePillar={activePillar}
                    datasets={datasets}
                    regionLookup={regionLookup}
                    countryData={countryData}
                />
            </div>
            <Footer />
        </div>
    );
}

export default App;
