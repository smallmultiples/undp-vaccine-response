import React from "react";
import Map from "../map/map";

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
        <React.Fragment>
            <Map
                countryData={countryData}
                countryDataLoading={loading}
                pillar={pillar}
                covidPillar={covidPillar}
                pillars={pillars}
                goal={goal}
            />
            {/*!isMapOnly && (
            <Questions
                activePillar={activePillar}
                covidPillar={covidPillar}
                datasets={datasets}
                countryData={countryData}
                hdiIndicator={hdiIndicator}
            />
        )*/}
        </React.Fragment>
    );
}
