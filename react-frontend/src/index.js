import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import Country from "./pages/country/country";
import BucketEmbed from "./pages/bucket-embed/bucket-embed";
import qs from "qs";
import regionLookup from "./modules/data/region-lookup.json";
import IndicatorTable from "./pages/indicator-table/indicator-table";

const trackingId = "UA-25119617-15";
ReactGA.initialize(trackingId);

function getEl(embedSelector) {
    if (typeof embedSelector === "string") {
        const el = document.querySelector(embedSelector);
        if (!el) throw new Error(`No div matching selector "${embedSelector}"`);
        return el;
    } else {
        return embedSelector;
    }
}

function slugToCountryCode(slug, allowEmpty = true) {
    if (!slug) {
        if (allowEmpty) {
            return null;
        } else {
            throw new Error(`Empty country slug provided.`);
        }
    }
    const countryRow = regionLookup.find(d => d["CMS slug"] === slug);
    if (!countryRow) {
        throw new Error(`Could not find country code for slug "${slug}".`);
    }
    return countryRow["ISO-alpha3 Code"];
}

function getUrlParams() {
    const { pathname, search } = window.location;

    // Pillars
    if (pathname.startsWith("/undps-response/") || pathname.startsWith("/covid-19/")) {
        const split = pathname.replace("/undps-response/", "").replace("/covid-19/", "").split("/");
        const pillarSlug = split[0];

        if (!pillarSlug) return null;

        const bucketSlug = split[1] || null;
        const query = qs.parse(search.replace("?", ""));

        if (!pillarSlug) throw new Error(`Could not parse pillar "${pillarSlug}".`);

        const countryCode = slugToCountryCode(query.country);

        return {
            type: "bucket",
            pillarSlug,
            bucketSlug,
            countryCode,
        };
    }

    if (pathname.startsWith("/country")) {
        const split = pathname.replace("/country/", "").split("/");

        const countrySlug = split[0];
        const countryCode = slugToCountryCode(countrySlug, false);

        return {
            type: "country",
            countryCode,
        };
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const params = getUrlParams();

    if (params) {
        console.log("Embed Params");
        console.table(params);

        if (params.type === "bucket") {
            ReactDOM.render(<BucketEmbed {...params} />, getEl("[data-bucket-embed]"));
            if (params.bucketSlug) {
                ReactDOM.render(<IndicatorTable {...params} />, getEl("[data-bucket-table-embed]"));
            }
        }

        if (params.type === "country") {
            ReactDOM.render(<Country {...params} />, getEl("[data-country-embed]"));
        }
    }
});
