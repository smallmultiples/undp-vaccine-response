import React from "react";
import styles from "./data-sources.module.scss";
import { uniqBy } from "lodash";

const COUNTRIES_TOTAL = 249;

const IconData = props => (
    <svg
        width="14"
        height="17"
        viewBox="0 0 14 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M14 2.78572V4.21428C14 5.47322 10.8646 6.5 7 6.5C3.13541 6.5 0 5.47322 0 4.21428V2.78572C0 1.52678 3.13541 0.5 7 0.5C10.8646 0.5 14 1.52678 14 2.78572ZM14 6V9.21428C14 10.4732 10.8646 11.5 7 11.5C3.13541 11.5 0 10.4732 0 9.21428V6C1.50391 7.03572 4.2565 7.51788 7 7.51788C9.7435 7.51788 12.4961 7.03572 14 6ZM14 11V14.2143C14 15.4732 10.8646 16.5 7 16.5C3.13541 16.5 0 15.4732 0 14.2143V11C1.50391 12.0357 4.2565 12.5179 7 12.5179C9.7435 12.5179 12.4961 12.0357 14 11Z"
            fill="#f3f7fe"
        />
    </svg>
);

export default function DataSources(props) {
    const { currentIndicators } = props;

    const indicators = uniqBy(
        Object.values(currentIndicators).filter(d => d.label),
        d => d.label
    ).filter(d => d.meta);

    if (!indicators.length) return null;

    const rows = indicators.map(indicator => {
        const { meta } = indicator;
        const label = indicator.tableLabel || indicator.label;
        const countryCount = COUNTRIES_TOTAL || meta.countryCount;

        const timePeriod = meta.timePeriod || "";
        const sources = meta.sources.map((s, i) => {
            return (
                <span key={`link_${i}`}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.name}
                    </a>
                    {i < meta.sources.length - 1 && ", "}
                </span>
            );
        });

        const countrysMissing = COUNTRIES_TOTAL - countryCount;
        const countrysString =
            countrysMissing > 0
                ? `${countryCount} countries are covered, ${countrysMissing} countries missing data. `
                : "";

        return (
            <li className={styles.dataSourceRow}>
                <span className={styles.indicatorName}>
                    <IconData />
                    {label}
                </span>
                <span className={styles.indicatorSource}>
                    {countrysString}Data last updated {timePeriod}, source: {sources}
                </span>
            </li>
        );
    });

    return (
        <div className={styles.dataSources}>
            <h5>This data view shows:</h5>
            <ul className={styles.dataSourcesList}>{rows}</ul>
        </div>
    );
}
