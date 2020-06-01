// from https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
// modified
export const formatSI = (decimals = 2) => num => {
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

export const formatPercent = (decimals = 2) => raw => formatComma(raw, decimals) + "%";

export const formatDecimal = (decimals = 2) => raw =>
    raw.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: 0 });

export const formatComma = (decimals = 0) => raw =>
    raw.toLocaleString(undefined, { maximumFractionDigits: decimals });

export const formatUSD = decimals => num => "$" + formatSI(num, decimals) + " USD";

export const formats = {
    SI: formatSI,
    percent: formatPercent,
    decimal: formatDecimal,
    comma: formatComma,
    usd: formatUSD,
};
