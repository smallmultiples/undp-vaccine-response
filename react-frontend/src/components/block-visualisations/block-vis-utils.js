import { mean } from "lodash";

export function getBlockVisValue(timeFilteredData, indicator, selectedCountryCode) {
    if (selectedCountryCode) {
        const countryData = timeFilteredData[selectedCountryCode];
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
