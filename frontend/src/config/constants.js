// export const DATA_SHEET_ID =
//     process.env.REACT_APP_COUNTRY_DATA_SHEET || "14KGG13epWHEnmgZi63WUyPpfmweEdRihTjo5yU7kn0U";

export const DATA_SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "18kNssP6H4GjGoK0C9K2L-B3UWq74R7R_rWvj9b4iOV0";

// export const META_SHEET_ID =
//     process.env.REACT_APP_META_DATA_SHEET || "154wokmdJg8cUw8Nau346JghPgLoqGnO5xBIudRcJHjA";

export const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1HZnH-5_1eEiVrWDxcZPjqYBghkPhDIUFbaqZaGj7OJo";

export const USE_SHEET =
    process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_SHEET === "true";

export const SHEET_SERVER_URL = `https://holy-sheet.visualise.today`;

export const STATIC_DATA_BASE_URL =
    process.env.REACT_APP_DATA_BASE_URL || process.env.PUBLIC_URL + "/data";

export const PILLAR_URL = USE_SHEET
    ? `${SHEET_SERVER_URL}/sheet/${META_SHEET_ID}?range=indicators-phase2`
    : `${STATIC_DATA_BASE_URL}/meta.json`;

export const SOURCES_URL = USE_SHEET
    ? `${SHEET_SERVER_URL}/sheet/${META_SHEET_ID}?range=last-updated`
    : `${STATIC_DATA_BASE_URL}/meta.json`;

export const KEY_STATS_URL = USE_SHEET
    ? `${SHEET_SERVER_URL}/sheet/${META_SHEET_ID}?range=pillars-key-stats`
    : `${STATIC_DATA_BASE_URL}/key-stats.json`;

/**
 * Sheet server URL for the country/subregion data
 */
export const DATA_SHEET_URL = `${SHEET_SERVER_URL}/sheet/${DATA_SHEET_ID}`;

export const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
    console.error("Please provide 'REACT_APP_MAPBOX_TOKEN' environment variable!");
}

export const MAPBOX_BASEMAP_STYLE_ID =
    process.env.REACT_APP_BASEMAP_ID ||
    "mapbox://styles/undpdata/ckeiht18j4tgz19nxgiw55toy" ||
    "mapbox://styles/smallmultiples/ckce9r0ee0kj31jrz4t34myuj";
