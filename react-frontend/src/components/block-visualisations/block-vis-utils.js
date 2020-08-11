import { mean } from "lodash";

export function getBlockVisValue(timeFilteredData, indicator, selectedCountry) {
    if (selectedCountry) {
        const countryData = timeFilteredData[selectedCountry.ISO3];
        return countryData[indicator.dataKey];
    } else {
        // Return the *average* for global
        return mean(
            Object.values(timeFilteredData)
                .map(d => d[indicator.dataKey])
                .filter(d => !isNaN(d))
        );
    }
}
