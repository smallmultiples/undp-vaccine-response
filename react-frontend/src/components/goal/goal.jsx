import React from "react";
import Map from "../map/map";
import styles from "./goal.module.scss";
import TimeSliderTemp from "./time-slider-temp.svg";

export default function Goal(props) {
    const { goal, pillar, pillarData } = props;
    const { pillars, data, regionLookup, loading } = pillarData;

    const covidPillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(d => d.covid);
    }, [pillars]);

    // TODO: replace
    // Countrydata is just a merge of all the datasets
    const countryData = React.useMemo(() => {
        if (loading) return null;

        let newData = {};
        Object.values(regionLookup).forEach(region => {
            newData[region["ISO-alpha3 Code"]] = region;
        });
        data.forEach(row => {
            const rowKey = row["Alpha-3 code"];
            newData[rowKey] = newData[rowKey] || {};

            Object.entries(row).forEach(([key, value]) => {
                newData[rowKey][key] = value;
            });
        });
        return newData;
    }, [data, loading, regionLookup]);

    return (
        <div className={styles.goal}>
            <div className={styles.tempGoalHeader}>
                <h2>{goal.label}</h2>
                <p>{goal.description}</p>
            </div>
            <div className={styles.mapArea}>
                <div className={styles.mapSidebar}>
                    <div className={styles.sidebarBlock}>
                        <h3>Placeholder</h3>
                    </div>
                    <div className={styles.sidebarBlock}>
                        <h3>Placeholder</h3>
                    </div>
                </div>
                <div className={styles.mapContainer}>
                    <Map
                        countryData={countryData}
                        countryDataLoading={loading}
                        pillar={pillar}
                        covidPillar={covidPillar}
                        pillars={pillars}
                        goal={goal}
                    />
                </div>
            </div>
            <div className={styles.timeArea}>
                <img src={TimeSliderTemp} alt="temporary time slider" />
            </div>
            {/*!isMapOnly && (
            <Questions
                pillar={pillar}
                covidPillar={covidPillar}
                datasets={datasets}
                countryData={countryData}
                hdiIndicator={hdiIndicator}
            />
        )*/}
        </div>
    );
}
