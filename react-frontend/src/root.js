import React from "react";
import Map from "./components/map/map";
import axios from "axios";
import styles from "./root.module.scss";
import Header from "./components/header/header";
import PILLARS from "./config/pillars";
import Pillars from "./components/pillars/pillars";
import { flatten, uniq } from "lodash";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "1o8FVEy59M0k8XHRm3TvCNpt-MQ8V_e0TaqqOGe7N1tQ";

const usePillarData = () => {
    const [datasets, setDatasets] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        (async () => {
            const sheetsToFetch = uniq(
                flatten(Object.values(PILLARS).map(p => p.questions.map(q => q.sheet))).filter(
                    Boolean
                )
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
    };
};

function App() {
    const { datasets, countryData, loading } = usePillarData();

    const [activePillar, setActivePillar] = React.useState(PILLARS.Health);
    const [activeIndicator, setActiveIndicator] = React.useState("Cumulative_cases");

    console.log({
        datasets,
        countryData,
    });

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <Header />
                <Pillars
                    activePillar={activePillar}
                    setActivePillar={setActivePillar}
                    activeIndicator={activeIndicator}
                    setActiveIndicator={setActiveIndicator}
                />
                <Map
                    countryData={countryData}
                    countryDataLoading={loading}
                    activePillar={activePillar}
                    activeIndicator={activeIndicator}
                />
            </div>
        </div>
    );
}

export default App;
