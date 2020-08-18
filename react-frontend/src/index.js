import React from "react";
import ReactDOM from "react-dom";
import Root from "./pages/root/root";
import * as serviceWorker from "./serviceWorker";
import ReactGA from "react-ga";
import Country from "./pages/country/country";
import BucketEmbed from "./pages/bucket-embed/bucket-embed";

const trackingId = "UA-25119617-15";
ReactGA.initialize(trackingId);

function getEl(embedSelector) {
    if (typeof embedSelector === "string") {
        return document.querySelector(embedSelector);
    } else {
        return embedSelector;
    }
}

window._UNDPDataPlatformEmbedGoal = function (embedSelector, pillarSlug, bucketIndex) {
    ReactDOM.render(
        <BucketEmbed pillarSlug={pillarSlug} bucketIndex={bucketIndex} />,
        getEl(embedSelector)
    );
};

window._UNDPDataPlatformEmbedCountry = function (embedSelector, countryCode) {
    ReactDOM.render(<Country countryCode={countryCode} />, getEl(embedSelector));
};

window._UNDPDataPlatformEmbedTest = function (embedSelector) {
    ReactDOM.render(<Root />, getEl(embedSelector));
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
