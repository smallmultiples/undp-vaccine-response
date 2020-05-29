const PILLARS = {
    Health: {
        label: "Health",
        labelShort: "Health",
        questions: [
            {
                key: "severity",
                label: "What is the severity of Covid?",
                hidden: true, // we may or may not show this in the tables. doesn't appear on map.
                sheet: "COHESION-COVID19", // why is this labelled cohesion?
            },
            {
                key: "gaps",
                label: "What are the gaps in health system capacity preparedness?",
                sheet: "HEALTH-BEDS-DOCS-NURSES",
                indicators: [
                    {
                        label: "Number of hospital beds per 10000 people",
                        dataKey: "Hospital beds",
                    },
                    {
                        label: "Physicians per 10000 people",
                        dataKey: "Physicians",
                    },
                    {
                        label: "Nurses and midwives per 10000 people",
                        dataKey: "Nurses and midwifes",
                    },
                ],
            },
        ],
        description:
            "Gaps in the health sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Protect: {
        label: "Protect",
        labelShort: "Protect",
        questions: [
            {
                key: "gaps",
                label: "What are countries’ response measures over Covid timeline?",
                sheet: "PROTECT-STRINGENCY-INDEX",
                indicators: [
                    {
                        label: "Stringency index",
                        dataKey:
                            "Government Response Stringency Index ((0 to 100, 100 = strictest))",
                    },
                ],
            },
            {
                key: "gaps",
                label: "Which countries are vulnerable to income, health and education shocks? ",
                sheet: "PROTECT-HDI",
                indicators: [
                    {
                        label: "HDI",
                        dataKey: "Human Development Index",
                    },
                ],
            },
        ],
        description:
            "Gaps in the protect sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Economy: {
        label: "Economy",
        labelShort: "Economy",
        questions: [
            {
                key: "msme-impact",
                label: "What is the impact of COVID-19 on MSMEs?",
                // TODO: sheet missing
                indicators: [
                    {
                        label: "Number of businesses that closed due to COVID-19",
                        dataKey: "UNKNOWN", // TODO: UNKNOWN where this data is.
                    },
                ],
            },
            {
                key: "msme-support",
                label: "How are governments supporting MSMEs in short/med/longer-term?",
                sheet: "ECONOMIC-MSME-GOV-SUPPORT",
                indicators: [
                    {
                        label:
                            "MSME support measures by govt (possibly categorize into financial / non-financial)",
                        dataKey: "Type of Support", // TODO: categorical :( what do
                    },
                    {
                        label:
                            "Flag for whether govt offers support for informal workers and informal/non-registered enterprises",
                        dataKey: "UNKNOWN", // TODO: find this data
                    },
                ],
            },
        ],
        description:
            "Gaps in the economy... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Macro: {
        label: "Macro",
        labelShort: "Macro",
        questions: [
            {
                key: "response",
                label: "What are countries’ response measures over Covid timeline?",
                sheet: "MACRO-BORDER-CLOSURES",
                indicators: [
                    {
                        label: "Date of border closure and government action/announcement",
                        dataKey: "UNKNOWN", // TODO: what to visualise here
                    },
                ],
            },
            {
                key: "support",
                label: "What are the gaps in financing above packages?",
                sheet: "MACRO-GOV-SUPPORT",
                indicators: [
                    {
                        label: "Government response to COVID",
                    },
                ],
            },
            {
                key: "finance",
                label: "How much is the overview of fiscal packages and amount?",
                sheet: "MACRO-GOV-SUPPORT",
                indicators: [
                    {
                        label: "Cost of government response",
                        dataKey: "Total Support USD",
                    },
                ],
            },
        ],
        description:
            "Gaps in the macro sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Cohesion: {
        label: "Cohesion",
        labelShort: "Cohesion",
        questions: [
            {
                key: "cohesion",
                label:
                    "How is COVID-19 affecting State-society relations, including the accountability of and trust in State institutions?",
                sheet: "COHESION-POLITICAL-VIOLENCE",
                // TODO: add COHESION-PRESS-FREEDOM ? structural change for jack.
            },
        ],
        description:
            "Gaps in the cohesion sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
};

export default PILLARS;
