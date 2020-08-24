import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import Country from "./pages/country/country";
import BucketEmbed from "./pages/bucket-embed/bucket-embed";
import qs from "qs";
import regionLookup from "./modules/data/region-lookup.json";

const trackingId = "UA-25119617-15";
ReactGA.initialize(trackingId);

function getEl(embedSelector) {
    if (typeof embedSelector === "string") {
        const el = document.querySelector(embedSelector);
        return el;
    } else {
        return embedSelector;
    }
}

function getUrlParams() {
    const { pathname, search } = window.location;

    // Pillar ->
    if (pathname.startsWith("/undps-response")) {
        const split = pathname.replace("/undps-response/", "").split("/");
        const pillarSlug = split[0];
        const bucketSlug = split[1] || null;
        const query = qs.parse(search.replace("?", ""));

        if (!pillarSlug) {
            console.error(`Could not parse pillar "${pillarSlug}".`);
            return null;
        }

        // TODO: slug to country code.
        let countryCode = null;
        if (query.country) {
            const countryRow = regionLookup.find(d => d["CMS slug"] === query.country);
            if (!countryRow) {
                console.error(`Could not find country code for slug "${query.country}".`);
                return null;
            }
            countryCode = countryRow["ISO-alpha3 Code"];
        }

        return {
            type: "bucket",
            pillarSlug,
            bucketSlug,
            countryCode,
        };
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const params = getUrlParams();

    console.log("Embed Params");
    console.table(params);

    if (params) {
        if (params.type === "bucket") {
            ReactDOM.render(<BucketEmbed {...params} />, getEl("[data-bucket-embed]"));
        }

        if (params.type === "country") {
            // TODO: ignoring for now.
            ReactDOM.render(<Country countryCode={"AU"} />, getEl("[data-country-embed]"));
        }
    }
});
