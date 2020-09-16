export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}

export const categorySplit = val => {
    return val
        .split(";")
        .map(d => d.trim())
        .filter(Boolean);
};

export function parseSheetDate(raw) {
    if (!isNaN(raw) && raw < 100000) {
        // Excel date. Days since 1/1/1900
        const utcDate = new Date((raw - (25567 + 2)) * 86400 * 1000);
        const tzOffset = utcDate.getTimezoneOffset();
        const offset = tzOffset * 60 * 1000;
        return new Date(utcDate.getTime() + offset);
    }

    return new Date(raw);
}

export const isDateValid = d => Boolean(d && !isNaN(d.getTime()));

export function saveBlob(filename, blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

export const getIndicatorDataKey = indicator => {
    return indicator.currentAggregation.key;
};

export const getRowIndicatorValue = (row, indicator) => {
    return row[indicator.currentAggregation.key];
};
