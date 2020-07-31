export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? result.slice(1, 4).map(n => parseInt(n, 16)) : null;
}

export const categorySplit = val =>
    val
        .split(";")
        .map(d => d.trim())
        .filter(Boolean);
