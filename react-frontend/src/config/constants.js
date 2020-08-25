export const DATA_SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "17eYbe5bdRTzftD8TqWAvBiYmzxZhpsqIDA5jN9zKq9w";

export const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

export const USE_SHEET =
    process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_SHEET === "true";

export const SHEET_SERVER_URL = `https://holy-sheet.visualise.today`;

export const STATIC_DATA_BASE_URL =
    process.env.REACT_APP_DATA_BASE_URL || process.env.PUBLIC_URL + "/data";

export const PILLAR_URL = USE_SHEET
    ? `${SHEET_SERVER_URL}/sheet/${META_SHEET_ID}?range=indicators-phase2`
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
    process.env.REACT_APP_BASEMAP_ID || "mapbox://styles/smallmultiples/ckce9r0ee0kj31jrz4t34myuj";
