const PILLARS = {
    Health: {
        label: "Health",
        labelShort: "Health",
        sheets: {
            bedsDocsNurses: "HEALTH-BEDS-DOCS-NURSES",
        },
        description:
            "Gaps in the health sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Protect: {
        label: "Protect",
        labelShort: "Protect",
        sheets: {
            hdi: "PROTECT-HDI",
            stringency: "PROTECT-STRINGENCY-INDEX",
        },
        description:
            "Gaps in the protect sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
    Economy: {
        label: "Economy",
        labelShort: "Economy",
        sheets: {
            msmeGovSupport: "ECONOMIC-MSME-GOV-SUPPORT",
        },
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
                        dataKey: "",
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
        sheets: {
            covid19: "COHESION-COVID19",
            politicalViolence: "COHESION-POLITICAL-VIOLENCE",
            pressFreedom: "COHESION-PRESS-FREEDOM",
        },
        description:
            "Gaps in the cohesion sector... Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus rutrum condimentum tortor gravida condimentum. Sed finibus lacus ipsum, ac feugiat nunc elementum sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur.",
    },
};

export default PILLARS;
