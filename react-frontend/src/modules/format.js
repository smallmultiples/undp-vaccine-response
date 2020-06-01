// from https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
// modified
export function formatSI(num, decimals = 2) {
    console.log("SI", decimals);
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
}

export const formatPercent = (v, decimals = 2) => formatComma(v, decimals) + "%";

export const formatDecimal = (raw, decimals = 2) =>
    raw.toLocaleString(undefined, { maximumFractionDigits: decimals });

export const formatComma = (raw, decimals = 0) =>
    raw.toLocaleString(undefined, { maximumFractionDigits: decimals });

export const formatCurrency = currency => (raw, decimals = 2) =>
    raw.toLocaleString(undefined, { style: "currency", currency, maximumFractionDigits: decimals });

export const formatUSD = (num, decimals) => "$" + formatSI(num, decimals) + " USD";

export const formats = {
    SI: formatSI,
    percent: formatPercent,
    decimal: formatDecimal,
    comma: formatComma,
    usd: formatUSD,
};
