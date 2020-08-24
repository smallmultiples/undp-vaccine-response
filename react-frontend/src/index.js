import React from "react";
import ReactDOM from "react-dom";
import Root from "./pages/root/root";
import * as serviceWorker from "./serviceWorker";
import ReactGA from "react-ga";
import Country from "./pages/country/country";
import BucketEmbed from "./pages/bucket-embed/bucket-embed";
import qs from "qs";

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
        const pillar = split[0];
        const bucketSlug = split[1];
        const query = qs.parse(search.replace("?", ""));

        if (!pillar) return null;

        // TODO: convert pillar
        const pillarSlug = pillar;

        // TODO: slug to index.
        const bucketIndex = bucketSlug ? 0 : 0;

        // TODO: slug to country code.
        const countryCode = query.country;

        return {
            type: "bucket",
            pillarSlug: pillar,
            bucketIndex: bucketSlug,
            countryCode,
        };
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const params = getUrlParams();

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
