import React from "react";
import Map from "./components/map/map";
import axios from "axios";

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "1o8FVEy59M0k8XHRm3TvCNpt-MQ8V_e0TaqqOGe7N1tQ";
const SHEET_RANGE = "COHESION-COVID19";

const useCountryData = () => {
    const [countryData, setCountryData] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            const res = await axios(
                `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=${SHEET_RANGE}`
            );
            setCountryData(res.data);
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
    const { countryData } = useCountryData();
    return (
        <div className="App">
            <h1>Socio-Economic Recovery Data Platform</h1>
            <Map countryData={countryData} />
        </div>
    );
}

export default App;
