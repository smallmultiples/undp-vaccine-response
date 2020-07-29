import { formats } from "../../modules/format";
import { last } from "lodash";

const numOrUndef = val => (isNaN(val) ? undefined : parseFloat(val));

export const parseMetaSheet = raw => {
    const out = {};
    let currentPillar = null;
    let currentQuestion = null;
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
                questions: {},
                visible: currentPillar !== "ALL",
                covid: currentPillar === "ALL",
            };
        }
        // -----------

        // Question
        const qs = row["Question"];
        if (qs) {
            currentQuestion = qs;
            out[currentPillar].questions[qs] = {
                label: qs,
                description: row["Question description"],
                indicators: {},
                hidden: qs === "-",
                categorical: false,
                comingSoon: row["Question coming soon"],
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
                const lastQuestionIndicator = last(
                    out[currentPillar].questions[currentQuestion].indicators
                );
                if (lastQuestionIndicator) {
                    // Copy the previous meta
                    meta = lastQuestionIndicator.meta;
                }
            }
            const categorical = row["Data Format"] === "category";
            if (categorical) {
                out[currentPillar].questions[currentQuestion].categorical = true;
            }

            // TODO: move formats to selectors.
            const decimals = numOrUndef(row["Decimal Places"]);
            const legendDpRaw = numOrUndef(row["Legend Decimals"]);
            const legendDecimals = isNaN(legendDpRaw) ? decimals : legendDpRaw;

            const tooltipDpRaw = numOrUndef(row["Tooltip Decimals"]);
            const tooltipDecimals = isNaN(tooltipDpRaw) ? decimals : tooltipDpRaw;
            const mapFormat = formats[row["Data Format"]]
                ? formats[row["Data Format"]](decimals)
                : formats.decimal(decimals);

            out[currentPillar].questions[currentQuestion].indicators[ind] = {
                label: ind,
                tableLabel: row["Indicator Label Table"],
                description: row["Indicator Description"],
                dataKey: row["Data Key"],
                tooltipExtra: row["Tooltip Key"] && {
                    key: row["Tooltip Key"],
                    label: row["Tooltip Label"] || row["Tooltip Key"],
                    format: formats[row["Tooltip Format"]]
                        ? formats[row["Tooltip Format"]](tooltipDecimals)
                        : mapFormat,
                },
                flipped: row["Invert Scale"],
                categorical: categorical,
                format: mapFormat,
                formatLegend: formats[row["Data Format"]]
                    ? formats[row["Data Format"]](legendDecimals)
                    : formats.decimal(legendDecimals),

                hdi: ind === "Human Development Index",
                meta,
            };
        }

        // ---------
    }

    const asArrays = Object.values(out).map(pillar => {
        const questions = Object.values(pillar.questions).map(question => {
            const indicators = Object.values(question.indicators);
            return {
                ...question,
                indicators,
            };
        });

        return {
            ...pillar,
            questions,
        };
    });

    return asArrays;
};

export default parseMetaSheet;
