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
        `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=indicators`
    ).then(d => d.data);

    const regionsPromise = await axios(
        `https://holy-sheet.visualise.today/sheet/${META_SHEET_ID}?range=regions!D:L`
    ).then(d => d.data);

    const sheetsToFetch = _.uniq(_.flatten(pillarsRaw.map(p => p["Sheet"]).filter(Boolean)));

    let datasets = {};
    await Promise.all(
        sheetsToFetch.map(async sheet => {
            const res = await axios(
                `https://holy-sheet.visualise.today/sheet/${SHEET_ID}?range=${sheet}`
            );
            datasets[sheet] = res.data;
        })
    );
    const regionLookup = await regionsPromise;

    // // Countrydata is just a merge of all the datasets
    // let countryData = {};
    // Object.values(regionLookup).forEach(region => {
    //     countryData[region["ISO-alpha3 Code"]] = region;
    // });
    // Object.values(datasets).forEach(dataset => {
    //     dataset.forEach(row => {
    //         const rowKey = row["Alpha-3 code"];
    //         countryData[rowKey] = countryData[rowKey] || {};

    //         Object.entries(row).forEach(([key, value]) => {
    //             countryData[rowKey][key] = value;
    //         });
    //     });
    // });

    await Promise.all([
        fs.writeFile("public/data/datasets.json", JSON.stringify(datasets)),
        fs.writeFile("public/data/meta.json", JSON.stringify(pillarsRaw)),
        fs.writeFile("public/data/regions.json", JSON.stringify(regionLookup)),
    ]);
    console.log("Done saving data.");
}

main().catch(e => console.error(e) || process.exit(1));
