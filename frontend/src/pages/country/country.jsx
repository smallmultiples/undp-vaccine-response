import axios from "axios";
import DeckGL, { GeoJsonLayer, MapView, MapController } from "deck.gl";
import React from "react";
import { StaticMap } from "react-map-gl";
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
import SubnationalLegend from "../../components/subnational-legend/subnational-legend";
import DataSources from "../../components/data-sources/data-sources";
import useMediaQuery from "../../hooks/use-media-query";

export default function Country(props) {
    const { countryCode } = props;

    const [subdivisionGeo, setSubdivisionGeo] = React.useState(null);
    const [hdiData, setHdiData] = React.useState(null);
    const [tooltip, setTooltip] = React.useState(null);
    const { isMobile } = useMediaQuery();

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

    // const countryName = React.useMemo(() => {
    //     if (!countryHdiData.length) return "";
    //     const row = countryHdiData.find(c => c["Country or Area"]);
    //     if (!row) return "-";
    //     return row["Country or Area"];
    // }, [countryHdiData]);

    const colourScaleHex = React.useMemo(() => {
        return hdi => {
            const bucket = Math.min(
                HDI_BUCKETS.findIndex((low, index) => {
                    const high =
                        index === HDI_BUCKETS.length - 1
                            ? Number.POSITIVE_INFINITY
                            : HDI_BUCKETS[index + 1];
                    return hdi >= low && hdi < high;
                }),
                HDI_BUCKETS.length - 2
            );
            return HDI_COLOURS[bucket];
        };
    }, []);

    const colourScaleRgb = React.useMemo(() => {
        return hdi => {
            const hex = colourScaleHex(hdi);
            return hexToRgb(hex).concat([128]);
        };
    }, [colourScaleHex]);

    const countryDataSourceIndicator = React.useMemo(() => {
        return {
            hdi: {
                label: "Human Development Index",
                meta: {
                    timePeriod: 2018,
                    lastUpdated: "2018",
                    sources: [
                        {
                            name: "Global Data Lab",
                            url: "https://globaldatalab.org/shdi/",
                        },
                    ],
                },
            },
        };
    }, []);

    const [
        mapContainerRef,
        viewport,
        handleViewStateChange,
        mapContainerDimensions,
    ] = useDeckViewport(bounds);

    const loading = React.useMemo(
        () => !Boolean(viewport && subdivisionGeo && countryHdiData.length && bounds),
        [viewport, subdivisionGeo, countryHdiData, bounds]
    );

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: subdivisionGeo,
            filled: true,
            getFillColor: shape => {
                const row = countryHdiData.find(row => getRowId(row) === getShapeId(shape));
                return colourScaleRgb(row.hdi);
            },
            stroked: true,
            getLineColor: [255, 255, 255],
            lineWidthMinPixels: 0.5,
            pickable: true,
            onHover: info => (info.object ? setTooltip(info) : setTooltip(null)),
            wrapLongitude: true,
        }),
    ];

    return (
        <div className={styles.countryEmbed}>
            <SubnationalLegend />
            <div className={styles.mapContainer} ref={mapContainerRef}>
                {!loading && (
                    <DeckGL
                        viewState={viewport}
                        controller={{ type: MapController, dragPan: !isMobile }}
                        layers={layers}
                        onViewStateChange={handleViewStateChange}
                        views={new MapView({ repeat: true })}
                    >
                        <StaticMap
                            mapboxApiAccessToken={MAPBOX_TOKEN}
                            mapStyle={MAPBOX_BASEMAP_STYLE_ID}
                        />
                    </DeckGL>
                )}
                <div className={styles.loader} data-visible={loading}>
                    {/* todo: nicer loader. move up? */}
                    <h4>Loading...</h4>
                </div>
                <MapTooltip
                    tooltip={tooltip}
                    countryHdiData={countryHdiData}
                    colourScaleHex={colourScaleHex}
                    mapContainerDimensions={mapContainerDimensions}
                />
            </div>
            <small className={styles.mapDisclaimer}>
                The designations employed and the presentation of material on this map do not imply
                the expression of any opinion whatsoever on the part of the Secretariat of the
                United Nations or UNDP concerning the legal status of any country, territory, city
                or area or its authorities, or concerning the delimitation of its frontiers or
                boundaries.
            </small>
            <DataSources currentIndicators={countryDataSourceIndicator} />
        </div>
    );
}

const getShapeId = shape => shape.properties["GDLcode"];
const getRowId = row => row["GDLCODE"];
const getShapeName = shape => shape.properties["region"];

const MapTooltip = props => {
    const { tooltip, countryHdiData, colourScaleHex, mapContainerDimensions } = props;

    const row = React.useMemo(() => {
        if (!tooltip) return null;
        return countryHdiData.find(row => getRowId(row) === getShapeId(tooltip.object));
    }, [tooltip, countryHdiData]);

    if (!row) return null;

    const clampedLeft = `min(${tooltip.x}px, calc(${mapContainerDimensions.width}px - 100%))`;
    const clampedY = `min(${tooltip.y}px, calc(${mapContainerDimensions.height}px - 100%))`;

    const transform = `translate(${clampedLeft}, ${clampedY})`;

    return (
        <div
            className={styles.tooltip}
            style={{
                transform,
            }}
        >
            <div className={styles.tooltipHeader}>
                <div className={styles.tooltipHeading}>{getShapeName(tooltip.object)}</div>
            </div>
            <div className={styles.tooltipBody}>
                <div className={styles.tooltipDatum}>
                    <div
                        className={styles.tooltipDatumIcon}
                        data-bivariate
                        style={{
                            background: colourScaleHex(row.hdi),
                        }}
                    />
                    <div className={styles.tooltipDatumText}>
                        <div className={styles.tooltipDatumLabel}>HDI</div>
                        <div className={styles.tooltipDatumValue}>{row.hdi}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
