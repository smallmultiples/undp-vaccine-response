import axios from "axios";
import React from "react";
import { feature as topojsonParse } from "topojson-client";
import { useRouteMatch } from "react-router-dom";

const DATA_BASE_URL = process.env.REACT_APP_DATA_BASE_URL || "http://localhost:5000/";

export default function Country(props) {
    const match = useRouteMatch();
    const countryCode = "AUS";

    const [subdivisionGeo, setSubdivisionGeo] = React.useState(null);

    React.useEffect(() => {
        axios(`${DATA_BASE_URL}/geo/subdivisions/${countryCode}.topojson`).then(res => {
            const parsed = topojsonParse(res.data, countryCode);
            console.log(parsed);
            setSubdivisionGeo(parsed);
        });
    }, [countryCode]);

    return (
        <div>
            <h2>Country Page</h2>
        </div>
    );
}
