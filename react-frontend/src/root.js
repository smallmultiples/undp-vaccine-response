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
import ReactGA from "react-ga";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "17eYbe5bdRTzftD8TqWAvBiYmzxZhpsqIDA5jN9zKq9w";

const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

const trackingId = "UA-25119617-15";
ReactGA.initialize(trackingId);

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
        const qs = row["Question"];
        if (qs) {
            currentQuestion = qs;
            out[currentPillar].questions[qs] = {
                label: qs,
                sheet: row["Sheet"],
                description: row["Question description"],
                indicators: {},
                hidden: qs === "-",
                categorical: false,
                comingSoon: row["Question coming soon"],
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
            const categorical = row["Data Format"] === "category";
            if (categorical) {
                out[currentPillar].questions[currentQuestion].categorical = true;
            }

            out[currentPillar].questions[currentQuestion].indicators[ind] = {
                label: ind,
                sheet: row["Sheet"], // TODO: temporary
                dataKey: row["Data Key"],
                tooltipKey: row["Tooltip Key"],
                flipped: row["Invert Scale"],
                categorical: categorical,
                format: formats[row["Data Format"]]
                    ? formats[row["Data Format"]](row["Decimal Places"])
                    : formats.decimal(row["Decimal Places"]),
                hdi: ind === "Human Development Index",
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
        (async () => {})();
    }, []);

    React.useEffect(() => {
        (async () => {
            const pillars = await axios(
                `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=indicators`
            ).then(d => parseMetaSheet(d.data));
            setPillars(pillars);

            const regionsPromise = await axios(
                `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=regions!D:L`
            )
                .then(d => d.data)
                .then(setRegionLookup);

            // TODO: remove concat when questions fixed
            const sheetsToFetch = uniq(
                flatten(pillars.map(p => p.questions.map(q => q.sheet))).filter(Boolean)
            ).concat(
                flatten(
                    pillars.map(p => flatten(p.questions.map(q => q.indicators.map(i => i.sheet))))
                ).filter(Boolean)
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
        regionLookup,
    };
};

// TODO: don't use regionLookup and instead use info from countryData
function App() {
    const { pillars, regionLookup, datasets, countryData, loading } = usePillarData();
    const [activePillar, setActivePillar] = React.useState(null);
    const [activeQuestion, setActiveQuestion] = React.useState(null);

    React.useEffect(() => {
        if (activePillar || !pillars) return;
        setActivePillar(pillars.find(d => d.visible));
    }, [pillars, activePillar]);

    React.useEffect(() => {
        if (!activePillar) return;
        setActiveQuestion(activePillar.questions[0]);
    }, [activePillar]);

    const covidPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(d => d.covid);
    }, [pillars]);

    const hdiIndicator = React.useMemo(() => {
        if (!pillars) return null;
        const indicators = flatten(pillars.map(p => flatten(p.questions.map(q => q.indicators))));
        return indicators.find(d => d.hdi);
    }, [pillars]);

    if (!pillars || !activePillar || !regionLookup || !activeQuestion) return null; // TODO loader

    return (
        <div className={styles.root}>
            <Header />
            <div className={styles.container}>
                <Pillars
                    activePillar={activePillar}
                    covidPillar={covidPillar}
                    setActivePillar={setActivePillar}
                    pillars={pillars}
                    activeQuestion={activeQuestion}
                    setActiveQuestion={setActiveQuestion}
                />
                <Map
                    countryData={countryData}
                    countryDataLoading={loading}
                    activePillar={activePillar}
                    covidPillar={covidPillar}
                    pillars={pillars}
                    activeQuestion={activeQuestion}
                />
                <Questions
                    activePillar={activePillar}
                    datasets={datasets}
                    regionLookup={regionLookup}
                    countryData={countryData}
                    hdiIndicator={hdiIndicator}
                />
            </div>
            <Footer />
        </div>
    );
}

export default App;
