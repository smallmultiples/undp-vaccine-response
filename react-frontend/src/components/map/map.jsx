import React from "react";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map.module.scss";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import Geostats from "geostats";

const useDomains = (countryData, displaySettings) => {
    // TODO: pass in settings.

    return React.useMemo(() => {
        const domainX = countryData
            ? extent(countryData, d => d[displaySettings.variateXColumn])
            : [0, 1];
        const domainY = countryData
            ? extent(countryData, d => d[displaySettings.variateYColumn])
            : [0, 1];

        return {
            variateX: domainX,
            variateY: domainY,
        };
    }, [countryData, displaySettings]);
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}
const bivariateColourMatrix = [
    ["#5C61DA", "#A088D6", "#BF88C6", "#DD88B7", "#F4618D"],
    ["#769AEA", "#959BDF", "#B79DD3", "#DCA0C6", "#F9A1BB"],
    ["#68ACF0", "#8BAFE7", "#B0B1DE", "#D6B4D4", "#FAB7CB"],
    ["#59C0F7", "#81C5F1", "#A6CAEB", "#CFCEE5", "#F8D3DF"],
    ["#0BC6FF", "#70DCFD", "#9FE5FA", "#CBEDF8", "#F2F2F3"],
].map(row => row.map(colour => hexToRgb(colour)));
const useScales = displaySettings => {
    return React.useMemo(() => {
        const circleRadiusScale = row => row.size * 25;

        const bivariateColourScale = row => {
            const maxIndex = bivariateColourMatrix.length - 1;
            const xIndex = Math.floor(row.variateX * maxIndex);
            const yIndex = maxIndex - Math.floor(row.variateY * maxIndex);
            return bivariateColourMatrix[yIndex][xIndex];
        };

        return {
            radius: circleRadiusScale,
            color: bivariateColourScale,
        };
    }, []);
};

const getNormalFromJenks = (jenks, value) => {
    const index = jenks.findIndex((j, i) => {
        const low = j;
        const top = jenks[i + 1];
        return value >= low && value <= top;
    });

    return index / (jenks.length - 2);
};

const useNormalizedData = (countryData, domains, displaySettings) => {
    return React.useMemo(() => {
        if (!countryData) return {};
        const normalize = {
            variateX: scaleLinear().range([0, 1]).domain(domains.variateX),
            variateY: scaleLinear().range([0, 1]).domain(domains.variateY),
        };
        const geostatsX = new Geostats(countryData.map(raw => raw[displaySettings.variateXColumn]));
        const geostatsY = new Geostats(countryData.map(raw => raw[displaySettings.variateYColumn]));

        const jenksX = geostatsX.getClassJenks(5);
        const jenksY = geostatsY.getClassJenks(5);

        let ret = {};
        countryData.forEach(raw => {
            ret[raw["Alpha-3 code"]] = {
                ...raw,
                variateX: getNormalFromJenks(jenksX, raw[displaySettings.variateXColumn]),
                variateY: getNormalFromJenks(jenksY, raw[displaySettings.variateYColumn]),
            };
            console.log(
                raw["Country"],
                ret[raw["Alpha-3 code"]].variateX,
                ret[raw["Alpha-3 code"]].variateY
            );
        });
        return ret;
    }, [countryData, displaySettings, domains]);
};

const useGeoData = () => {
    const [shapeData, setShapeData] = React.useState(null);

    React.useEffect(() => {
        // Only load shapes once.
        (async () => {
            const res = await axios(`${process.env.PUBLIC_URL}/data/world.topojson`);
            const fc = topojsonParse(res.data, "world");
            setShapeData(fc);
        })();
    }, []);

    const loading = React.useMemo(() => {
        return [shapeData].some(d => !d);
    }, [shapeData]);

    return {
        shapeData,
        loading,
    };
};

const Map = props => {
    const { countryData } = props;

    return (
        <div>
            <MapVis countryData={countryData} />
        </div>
    );
};

const MapVis = props => {
    const { countryData } = props;
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewState, setViewState] = React.useState({
        longitude: 0,
        latitude: 0,
        zoom: 1,
        pitch: 0,
        bearing: 0,
    });
    const displaySettings = React.useMemo(
        () => ({
            variateXColumn: "Cumulative_cases",
            variateYColumn: "Cumulative_deaths",
        }),
        []
    );
    const { shapeData, loading: geoLoading } = useGeoData();
    const domains = useDomains(countryData, displaySettings);
    const scales = useScales(displaySettings);
    const normalizedData = useNormalizedData(countryData, domains, displaySettings);

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: shapeData,
            filled: true,
            getFillColor: shape => {
                const row = normalizedData[shape.properties["ISO3"]];
                if (!row) {
                    console.log("MISS " + shape.properties["ISO3"]);
                    return [255, 0, 0, 0];
                }
                return scales.color(row);
            },
            stroked: true,
            getLineColor: [255, 255, 255],
            lineWidthMinPixels: 0.5,
            updateTriggers: {
                getFillColor: [normalizedData],
            },
        }),
    ];

    return (
        <div>
            <div className={styles.mapContainer} ref={mapContainerRef}>
                <DeckGL initialViewState={viewState} controller={true} layers={layers}></DeckGL>
                <div className={styles.loader} data-visible={geoLoading}>
                    <h4>Loading...</h4>
                </div>
            </div>
        </div>
    );
};

export default Map;
