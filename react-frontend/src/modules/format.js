// from https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
// modified
export function formatSI(num, decimals = 2) {
    var si = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "K" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "B" },
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
            .toLocaleString(locale, { maximumFractionDigits: decimals })
            .replace(rx, "$1") + si[i].symbol
    );
}

export const formatPercent = (v, decimals = 2) => formatComma(v, decimals) + "%";

export const formatDecimal = (raw, decimals = 2) =>
    raw.toLocaleString(null, { maximumFractionDigits: decimals });

export const formatComma = (raw, decimals = 0) =>
    raw.toLocaleString(null, { maximumFractionDigits: decimals });

export const formats = {
    SI: formatSI,
    percent: formatPercent,
    decimal: formatDecimal,
    comma: formatComma,
};
