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
import Expandable from "./components/pillars/pillar-expandable";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "17eYbe5bdRTzftD8TqWAvBiYmzxZhpsqIDA5jN9zKq9w";

const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

const USE_SHEET =
    process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_SHEET === "true";

const trackingId = "UA-25119617-15";
ReactGA.initialize(trackingId);

const numOrUndef = val => (isNaN(val) ? undefined : parseFloat(val));

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

            const decimals = numOrUndef(row["Decimal Places"]);
            const legendDpRaw = numOrUndef(row["Legend Decimals"]);
            const legendDecimals = isNaN(legendDpRaw) ? decimals : legendDpRaw;

            const tooltipDpRaw = numOrUndef(row["Tooltip Decimals"]);
            const tooltipDecimals = isNaN(tooltipDpRaw) ? decimals : tooltipDpRaw;
            const mapFormat = formats[row["Data Format"]]
                ? formats[row["Data Format"]](decimals)
                : formats.decimal(decimals);

            out[currentPillar].questions[currentQuestion].indicators[ind] = {
                label: ind,
                tableLabel: row["Indicator Label Table"],
                dataKey: row["Data Key"],
                tooltipExtra: row["Tooltip Key"] && {
                    key: row["Tooltip Key"],
                    label: row["Tooltip Label"] || row["Tooltip Key"],
                    format: formats[row["Tooltip Format"]]
                        ? formats[row["Tooltip Format"]](tooltipDecimals)
                        : mapFormat,
                },
                flipped: row["Invert Scale"],
                categorical: categorical,
                format: mapFormat,
                formatLegend: formats[row["Data Format"]]
                    ? formats[row["Data Format"]](legendDecimals)
                    : formats.decimal(legendDecimals),

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
        (async () => {
            const pillarUrl = USE_SHEET
                ? `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=indicators`
                : `${process.env.PUBLIC_URL}/data/meta.json`;
            const pillars = await axios(pillarUrl).then(d => parseMetaSheet(d.data));
            setPillars(pillars);

            const regionsUrl = USE_SHEET
                ? `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=regions!D:L`
                : `${process.env.PUBLIC_URL}/data/regions.json`;
            const regionsPromise = await axios(regionsUrl)
                .then(d => d.data)
                .then(setRegionLookup);

            let newSets = {};

            if (USE_SHEET) {
                const sheetsToFetch = uniq(
                    flatten(pillars.map(p => p.questions.map(q => q.sheet))).filter(Boolean)
                );

                await Promise.all(
                    sheetsToFetch.map(async sheet => {
                        const res = await axios(
                            `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=${sheet}`
                        );
                        newSets[sheet] = res.data;
                    })
                );
            } else {
                newSets = await axios(`${process.env.PUBLIC_URL}/data/datasets.json`).then(
                    d => d.data
                );
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

function App() {
    const { pillars, datasets, countryData, loading } = usePillarData();
    const [activeQuestion, setActiveQuestion] = React.useState(null);

    React.useEffect(() => {
        if (activeQuestion || !pillars) return;
        const questions = flatten(pillars.filter(d => d.visible).map(p => p.questions));
        setActiveQuestion(questions[0]);
    }, [pillars, activeQuestion]);

    const covidPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(d => d.covid);
    }, [pillars]);

    const activePillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(pillar => pillar.questions.some(q => q === activeQuestion));
    }, [activeQuestion]);

    const hdiIndicator = React.useMemo(() => {
        if (!pillars) return null;
        const indicators = flatten(pillars.map(p => flatten(p.questions.map(q => q.indicators))));
        return indicators.find(d => d.hdi);
    }, [pillars]);

    if (!pillars || !activePillar || !activeQuestion) return null; // TODO loader

    return (
        <div className={styles.root}>
            <Header />
            <div className={styles.container}>
                <Pillars
                    activePillar={activePillar}
                    covidPillar={covidPillar}
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
                    covidPillar={covidPillar}
                    datasets={datasets}
                    countryData={countryData}
                    hdiIndicator={hdiIndicator}
                />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>
            <Footer />
        </div>
    );
}

export default App;
