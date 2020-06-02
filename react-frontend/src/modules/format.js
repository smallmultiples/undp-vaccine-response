import { last, isNil } from "lodash";
// from https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
// modified
const isDef = num => !isNaN(num);

export const formatSI = (decimals = 2) => num => {
    if (!isDef(num)) return undefined;
    var si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
        { value: 1e12, symbol: "T" },
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (
        (num / si[i].value)
            .toLocaleString(undefined, { maximumFractionDigits: decimals })
            .replace(rx, "$1") + si[i].symbol
    );
};

export const formatPercent = (decimals = 2) => raw => {
    if (!isDef(raw)) return "-";
    return formatComma(raw, decimals) + "%";
};

export const formatDecimal = (decimals = 2) => raw => {
    if (!isDef(raw)) return "-";
    return raw.toLocaleString(undefined, {
        maximumFractionDigits: decimals,
        minimumFractionDigits: 0,
    });
};

export const formatComma = (decimals = 0) => raw => {
    if (!isDef(raw)) return "-";
    return raw.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

export const formatUSD = decimals => {
    const si = formatSI(decimals);
    return raw => {
        if (!isDef(raw)) return "-";
        return "$" + si(raw) + " USD";
    };
};

export const formatCategory = () => raw => {
    if (isNil(raw)) return "-";
    const split = raw.split(";").map(d => d.trim());
    if (split.length === 1) return split;
    return split.slice(0, -1).join(", ") + " and " + last(split);
};

export const formats = {
    SI: formatSI,
    percent: formatPercent,
    decimal: formatDecimal,
    comma: formatComma,
    usd: formatUSD,
    category: formatCategory,
};
