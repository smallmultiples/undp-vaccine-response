import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";
import BucketEmbed from "./pages/bucket-embed/bucket-embed";
import IndicatorTable from "./pages/indicator-table/indicator-table";
import FactoidEmbed from "./pages/factoid-embed/factoid-embed";

const trackingId = process.env.REACT_APP_GA_TRACKING_ID;
if (trackingId) {
    ReactGA.initialize(trackingId);
}

function getEl(embedSelector) {
    if (typeof embedSelector === "string") {
        const el = document.querySelector(embedSelector);
        // if (!el) throw new Error(`No div matching selector "${embedSelector}"`);
        if (!el) return;
        return el;
    } else {
        return embedSelector;
    }
}

function getUrlParams() {
    const { pathname } = window.location;

    const split = pathname.split("/").filter(x => x !== "");

    let pillarSlug = "";
    let bucketSlug = "";

    if (split.length === 1) {
        pillarSlug = split[0]
    } else {
        pillarSlug = split[split.length - 2];
        bucketSlug = split[split.length - 1] || null;
    }
    
    return {
        type: "bucket",
        pillarSlug,
        bucketSlug,
    };
}

window.addEventListener("DOMContentLoaded", () => {
    const params = getUrlParams();

    if (params) {
        console.log("Embed Params");
        console.table(params);

        if (params.type === "bucket") {
            if (!params.bucketSlug) {
                const factoidOneElement = getEl("[data-factoid-1-embed]")
                const factoidTwoElement = getEl("[data-factoid-2-embed]")
                const factoidThreeElement = getEl("[data-factoid-3-embed]")
                const factoidFourElement = getEl("[data-factoid-4-embed]")
                if (factoidOneElement) {
                    ReactDOM.render(<FactoidEmbed {...params} factoidNumber={1} />, factoidOneElement);
                }
                if (factoidTwoElement) {
                    ReactDOM.render(<FactoidEmbed {...params} factoidNumber={2} />, factoidTwoElement);
                }
                if (factoidThreeElement) {
                    ReactDOM.render(<FactoidEmbed {...params} factoidNumber={3} />, factoidThreeElement);
                }
                if (factoidFourElement) {
                    ReactDOM.render(<FactoidEmbed {...params} factoidNumber={4} />, factoidFourElement);
                }
            } else {
                ReactDOM.render(<BucketEmbed {...params} />, getEl("[data-bucket-embed]"));
                ReactDOM.render(<IndicatorTable {...params} />, getEl("[data-bucket-table-embed]"));
            }
        }
    }
});
