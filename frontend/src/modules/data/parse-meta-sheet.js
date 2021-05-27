import { formats } from "../../modules/format";

const numOrUndef = val => (isNaN(val) ? undefined : parseFloat(val));

const parseAggregation = row => {
    const raw = row["Aggregation"];
    const dataKey = row["Data Key"];
    const prefix = dataKey + "::";
    const base = [{ key: dataKey, label: "Total" }];
    const addditional = raw
        ? raw.split(";").map(label => ({
              key: prefix + label,
              label,
          }))
        : [];
    return [...base, ...addditional];
};

export const parseMetaSheet = raw => {
    const out = {};
    let currentPillar = null;
    let currentGoal = null;
    for (let row of raw) {
        // Pillar
        const pillarSlug = row["Pillar slug"];
        if (pillarSlug) {
            currentPillar = pillarSlug;
            out[currentPillar] = {
                label: currentPillar,
                labelLong: row["Pillar long"],
                tagline: row["Pillar tagline"],
                description: row["Pillar Description"],
                slug: pillarSlug,
                goals: {},
                visible: currentPillar !== "common",
            };
        }
        // -----------

        // Goal
        const qs = row["Goal"];
        if (qs) {
            currentGoal = qs;
            out[currentPillar].goals[qs] = {
                label: qs,
                description: row["Goal description"],
                slug: row["Goal Slug"],
                indicators: {},
                hidden: qs === "-",
                sheet: row["Sheet"],
                id: "",
                defaultBaseIndicator: row["Default base indicator"],
                prioritizeCommonTrackingIndicators:
                    row["Prioritize Common Tracking Indicators"] || false,
            };
        }
        // ------------

        // Indicator
        const ind = row["Indicator"];
        if (ind) {
            let meta = null;
            if (
                row["Time period"] ||
                row["Data source name"] ||
                row["Data source link"] ||
                row["Number of Countries"] ||
                row["Last updated"]
            ) {
                const names = (row["Data source name"] || "").split(";").map(d => d.trim());
                const urls = (row["Data source link"] || "").split(";").map(d => d.trim());
                const sources = names.map((name, i) => {
                    return {
                        name,
                        url: urls[i],
                    };
                });
                const countryCount = row["Number of Countries"] || 0;
                meta = {
                    timePeriod: row["Time period"],
                    lastUpdated: row["Last updated"],
                    sources,
                    countryCount,
                };
            }

            const decimals = numOrUndef(row["Decimal Places"]);
            const legendDpRaw = numOrUndef(row["Legend Decimals"]);
            const legendDecimals = isNaN(legendDpRaw) ? decimals : legendDpRaw;

            const tooltipDpRaw = numOrUndef(row["Tooltip Decimals"]);
            const tooltipDecimals = isNaN(tooltipDpRaw) ? decimals : tooltipDpRaw;
            const mapFormat = formats[row["Data Format"]]
                ? formats[row["Data Format"]](decimals)
                : formats.decimal(decimals);

            const aggregations = parseAggregation(row);

            out[currentPillar].goals[currentGoal].indicators[ind] = {
                label: ind,
                tableLabel: row["Indicator Label Table"],
                description: row["Indicator Description"],
                isProgressIndicator: row["Progress Indicator"],
                dataKey: row["Data Key"],
                tooltipExtra: row["Tooltip Key"] && {
                    key: row["Tooltip Key"],
                    label: row["Tooltip Label"] || row["Tooltip Key"],
                    format: formats[row["Tooltip Format"]]
                        ? formats[row["Tooltip Format"]](tooltipDecimals)
                        : mapFormat,
                },
                flipped: row["Invert Scale"],
                categorical: row["Data Format"] === "category",
                binary: row["Data Format"] === "binary",
                isDate: row["Data Format"] === "date",
                categoryFormat: row["Category Format"],
                format: mapFormat,
                formatLegend: formats[row["Data Format"]]
                    ? formats[row["Data Format"]](legendDecimals)
                    : formats.decimal(legendDecimals),
                hdi: ind === "Human Development Index",
                meta,
                goal: out[currentPillar].goals[currentGoal],
                isComposite: row["Composite Indicator"],
                isGradient: row["Gradient Category Indicator"],
                aggregations,
                currentAggregation: aggregations[0],
            };
        }

        // ---------
    }

    const asArrays = Object.values(out).map(pillar => {
        const goals = Object.values(pillar.goals)
            .map((goal, i) => {
                const indicators = Object.values(goal.indicators);
                return {
                    ...goal,
                    id: i + 1,
                    indicators,
                };
            })
            .filter(goal => goal.indicators.length > 0);

        return {
            ...pillar,
            goals,
        };
    });

    return asArrays;
};

export default parseMetaSheet;
