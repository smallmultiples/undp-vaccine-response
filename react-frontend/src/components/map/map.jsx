import React from "react";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import { StaticMap } from "react-map-gl";
import useDimensions from "../../hooks/use-dimensions";
import axios from "axios";
import { feature as topojsonParse } from "topojson-client";
import styles from "./map.module.scss";

const useData = () => {
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
    const [mapContainerRef, mapContainerDimensions] = useDimensions();
    const [viewState, setViewState] = React.useState({
        longitude: 0,
        latitude: 0,
        zoom: 1,
        pitch: 0,
        bearing: 0,
    });

    const { shapeData, loading } = useData();

    const layers = [
        new GeoJsonLayer({
            id: "world",
            data: shapeData,
            filled: true,
            getFillColor: [160, 160, 180, 200],
            stroked: true,
            getLineColor: [0, 0, 0, 0],
        }),
    ];

    return (
        <div>
            <div className={styles.mapContainer} ref={mapContainerRef}>
                <DeckGL initialViewState={viewState} controller={true} layers={layers}></DeckGL>
                <div className={styles.loader} data-visible={loading}>
                    <h4>Loading...</h4>
                </div>
            </div>
        </div>
    );
};

export default Map;
