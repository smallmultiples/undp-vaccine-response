export const DATA_SHEET_ID =
    process.env.REACT_APP_COUNTRY_DATA_SHEET || "17eYbe5bdRTzftD8TqWAvBiYmzxZhpsqIDA5jN9zKq9w";

export const META_SHEET_ID =
    process.env.REACT_APP_META_DATA_SHEET || "1IjLAiaB0f_yPZ-SgAxE8I74aBi1L-BerfWonZxMYTXs";

export const USE_SHEET =
    process.env.NODE_ENV === "development" || process.env.REACT_APP_USE_SHEET === "true";

export const STATIC_DATA_BASE_URL = process.env.REACT_APP_DATA_BASE_URL || "/data";
