const axios = require("axios");
const _ = require("lodash");
const fs = require("fs").promises;

const SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "17eYbe5bdRTzftD8TqWAvBiYmzxZhpsqIDA5jN9zKq9w";

const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

async function main() {
    console.log("Saving data to src directory");
    const pillarsRaw = await axios(
        `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=indicators-phase2`
    ).then(d => d.data);

    const regionsPromise = await axios(
        `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=regions!D:M`
    ).then(d => d.data);

    const keyStatsPromise = await axios(
        `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=pillars-key-stats`
    ).then(d => d.data);

    const sheetsToFetch = _.uniq(_.flatten(pillarsRaw.map(p => p["Sheet"]).filter(Boolean)));

    await Promise.all(
        sheetsToFetch.map(async sheet => {
            const res = await axios(
                `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=${sheet}`
            );
            await fs.writeFile(`public/data/${sheet}.json`, JSON.stringify(res.data));
        })
    );
    const regionLookup = await regionsPromise;
    const keyStats = await keyStatsPromise;

    await Promise.all([
        fs.writeFile("public/data/meta.json", JSON.stringify(pillarsRaw)),
        fs.writeFile("src/modules/data/region-lookup.json", JSON.stringify(regionLookup)),
        fs.writeFile("public/data/key-stats.json", JSON.stringify(keyStats)),
    ]);
    console.log("Done saving data.");
}

main().catch(e => console.error(e) || process.exit(1));
