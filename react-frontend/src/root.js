import React from "react";
import Map from "./components/map/map";
import axios from "axios";

import styles from "./root.module.scss";
import Header from "./components/header/header";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "1o8FVEy59M0k8XHRm3TvCNpt-MQ8V_e0TaqqOGe7N1tQ";
const SHEET_RANGE = "COHESION-COVID19"; // TODO: just map sheet

const useCountryData = () => {
    const [countryData, setCountryData] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            const datasets = await Promise.all(
                [
                    axios(
                        `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=COHESION-COVID19`
                    ),
                    axios(
                        `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=HEALTH-BEDS-DOCS-NURSES`
                    ),
                ].map(d => d.then(x => x.data))
            );

            let data = {};

            datasets.forEach(dataset => {
                dataset.forEach(row => {
                    const rowKey = row["Alpha-3 code"];
                    data[rowKey] = data[rowKey] || {};

                    Object.entries(row).forEach(([key, value]) => {
                        data[rowKey][key] = value;
                    });
                });
            });

            setCountryData(data);
        })();
    }, []);

    const loading = React.useMemo(() => {
        return !countryData;
    }, [countryData]);

    return {
        countryData,
        loading,
    };
};

function App() {
    const { countryData, loading } = useCountryData();
    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <Header />
                <Map countryData={countryData} countryDataLoading={loading} />
            </div>
        </div>
    );
}

export default App;
