import axios from "axios";
import React from "react";
import { feature as topojsonParse } from "topojson-client";
import { useRouteMatch } from "react-router-dom";
import { STATIC_DATA_BASE_URL, DATA_SHEET_ID, USE_SHEET } from "../../config/constants";

export default function Country(props) {
    const match = useRouteMatch();
    const countryCode = match.params.countryCode;

    const [subdivisionGeo, setSubdivisionGeo] = React.useState(null);
    const [hdiData, setHdiData] = React.useState(null);

    React.useEffect(() => {
        axios(`${STATIC_DATA_BASE_URL}/geo/subdivisions/${countryCode}.topojson`).then(res => {
            const parsed = topojsonParse(res.data, countryCode);
            setSubdivisionGeo(parsed);
        });
    }, [countryCode]);

    React.useEffect(() => {
        // TODO: add to import script
        const url = USE_SHEET
            ? `https://holy-sheet.visualise.today/sheet/${DATA_SHEET_ID}?range=SUBDIVISION-HDI`
            : `https://holy-sheet.visualise.today/sheet/${DATA_SHEET_ID}?range=SUBDIVISION-HDI`;
        axios(url)
            .then(d => d.data)
            .then(setHdiData);
    });

    if (!subdivisionGeo || !hdiData) return null;

    return (
        <div>
            <h2>Country Page: {countryCode}</h2>
            <code>{JSON.stringify(hdiData, null, 4)}</code>
        </div>
    );
}
