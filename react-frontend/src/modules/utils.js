export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}

export const categorySplit = val =>
    val
        .split(";")
        .map(d => d.trim())
        .filter(Boolean);

export function parseSheetDate(raw) {
    if (!isNaN(raw) && raw < 100000) {
        // Excel date. Days since 1/1/1900
        return new Date((raw - (25567 + 2)) * 86400 * 1000);
    }

    return new Date(raw);
}

export const isDateValid = d => Boolean(d && !isNaN(d.getTime()));
