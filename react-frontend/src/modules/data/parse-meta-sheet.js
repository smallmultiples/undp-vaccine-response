import { formats } from "../../modules/format";
import { last } from "lodash";

const numOrUndef = val => (isNaN(val) ? undefined : parseFloat(val));

const parseVisConfig = rawConfig => {
    if (!rawConfig) return {};
    try {
        return JSON.parse(rawConfig);
    } catch (e) {
        throw new Error("Error parsing visualisation config", rawConfig);
    }
};

export const parseMetaSheet = raw => {
    const out = {};
    let currentPillar = null;
    let currentGoal = null;
    for (let row of raw) {
        // Pillar
        if (row.col0) {
            currentPillar = last(row.col0.split(" "));
            out[currentPillar] = {
                label: currentPillar,
                labelLong: row["Pillar long"],
                tagline: row["Pillar tagline"],
                description: row["Pillar Description"],
                slug: row["Pillar slug"],
                goals: {},
                visible: currentPillar !== "ALL",
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
                row["How often updated"]
            ) {
                const names = row["Data source name"].split(";").map(d => d.trim());
                const urls = row["Data source link"].split(";").map(d => d.trim());
                const sources = names.map((name, i) => {
                    return {
                        name,
                        url: urls[i],
                    };
                });
                const countryCount = row["Number of Countries"];
                meta = {
                    currency: row["Time period"],
                    updateFrequency: row["How often updated"],
                    sources,
                    countryCount,
                };
            } else {
                const lastGoalIndicator = last(out[currentPillar].goals[currentGoal].indicators);
                if (lastGoalIndicator) {
                    // Copy the previous meta
                    meta = lastGoalIndicator.meta;
                }
            }

            const decimals = numOrUndef(row["Decimal Places"]);
            const legendDpRaw = numOrUndef(row["Legend Decimals"]);
            const legendDecimals = isNaN(legendDpRaw) ? decimals : legendDpRaw;

            const tooltipDpRaw = numOrUndef(row["Tooltip Decimals"]);
            const tooltipDecimals = isNaN(tooltipDpRaw) ? decimals : tooltipDpRaw;
            const mapFormat = formats[row["Data Format"]]
                ? formats[row["Data Format"]](decimals)
                : formats.decimal(decimals);

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
                isVisualised: row["Visualise"],
                visType: row["Visualisation Type"],
                visualisationLocation: row["Visualisation Location"],
                visualisationConfig: parseVisConfig(row["Visualisation Config"]),
                flipped: row["Invert Scale"],
                categorical: row["Data Format"] === "category",
                categoryFormat: row["Category Format"],
                format: mapFormat,
                formatLegend: formats[row["Data Format"]]
                    ? formats[row["Data Format"]](legendDecimals)
                    : formats.decimal(legendDecimals),
                hdi: ind === "Human Development Index",
                meta,
                goal: out[currentPillar].goals[currentGoal],
            };
        }

        // ---------
    }

    const asArrays = Object.values(out).map(pillar => {
        const goals = Object.values(pillar.goals)
            .map(goal => {
                const indicators = Object.values(goal.indicators);
                return {
                    ...goal,
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
