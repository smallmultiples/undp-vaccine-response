import axios from "axios";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import React from "react";
import { StaticMap } from "react-map-gl";
import { useRouteMatch } from "react-router-dom";
import { feature as topojsonParse } from "topojson-client";
import {
    DATA_SHEET_ID,
    MAPBOX_BASEMAP_STYLE_ID,
    MAPBOX_TOKEN,
    STATIC_DATA_BASE_URL,
    USE_SHEET,
} from "../../config/constants";
import useDeckViewport from "../../hooks/use-deck-viewport";
import styles from "./country.module.scss";

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
    }, []);

    const countryHdiData = React.useMemo(() => {
        if (!hdiData) return [];
        return hdiData.filter(row => row["Alpha-3 code"] === countryCode);
    }, [countryCode, hdiData]);

    const [
        mapContainerRef,
        viewport,
        handleViewStateChange,
        mapContainerDimensions,
    ] = useDeckViewport();

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: subdivisionGeo,
            filled: true,
            getFillColor: shape => {
                const row = countryHdiData.find(d => d["GDLCODE"] === shape.properties["GDLcode"]);
                return [222, 222, 222];
                // return scales.color(row);
            },
            stroked: true,
            getLineColor: [255, 0, 0],
            lineWidthMinPixels: 0.5,
            pickable: false,
        }),
    ];

    return (
        <div>
            <h2>Country Page: {countryCode}</h2>
            <div className={styles.mapContainer} ref={mapContainerRef}>
                {viewport && (
                    <DeckGL
                        viewState={viewport}
                        controller
                        layers={layers}
                        onViewStateChange={handleViewStateChange}
                    >
                        <StaticMap
                            mapboxApiAccessToken={MAPBOX_TOKEN}
                            mapStyle={MAPBOX_BASEMAP_STYLE_ID}
                        />
                    </DeckGL>
                )}
            </div>
        </div>
    );
}
