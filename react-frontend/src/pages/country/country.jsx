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
import bbox from "@turf/bbox";
import styles from "./country.module.scss";
import { HDI_BUCKETS, HDI_COLOURS } from "../../config/scales";
import { hexToRgb } from "../../modules/utils";

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

    const bounds = React.useMemo(() => {
        if (!subdivisionGeo) return undefined;
        const raw = bbox(subdivisionGeo);
        return [
            [raw[0], raw[1]],
            [raw[2], raw[3]],
        ];
    }, [subdivisionGeo]);

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

    const colourScale = React.useMemo(() => {
        return hdi => {
            const bucket = Math.min(
                HDI_BUCKETS.findIndex((low, index) => {
                    const high =
                        index === HDI_BUCKETS.length - 1
                            ? Number.POSITIVE_INFINITY
                            : HDI_BUCKETS[index + 1];
                    if (hdi >= low && hdi < high) return true;
                }),
                HDI_BUCKETS.length - 2
            );
            const hex = HDI_COLOURS[bucket];

            return hexToRgb(hex);
        };
    });

    const [
        mapContainerRef,
        viewport,
        handleViewStateChange,
        mapContainerDimensions,
    ] = useDeckViewport(bounds);

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: subdivisionGeo,
            filled: true,
            getFillColor: shape => {
                const row = countryHdiData.find(d => d["GDLCODE"] === shape.properties["GDLcode"]);
                return colourScale(row.hdi);
            },
            stroked: true,
            getLineColor: [255, 255, 255],
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
