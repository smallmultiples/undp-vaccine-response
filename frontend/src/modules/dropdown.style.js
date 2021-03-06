const lightBlue = "#F3F7FE";
const navy = "#110848";
const font = `"proxima-nova"`;

export default {
    control: (provided, state) => ({
        ...provided,
        borderRadius: state.menuIsOpen ? "22px 22px 0 0 " : 22,
        // boxShadow: "0 0 12px 8px rgba(0,0,0,0.03)",
        background: state.isDisabled ? "white" : lightBlue,
        border: state.isDisabled ? `2px solid ${lightBlue}` : "2px solid transparent",
        padding: "0",
        boxSizing: "border-box",
        fontFamily: font,
        fontWeight: "bold",
        transition: "border-radius 200ms",
        zIndex: state.menuIsOpen ? 10 : 8,
    }),

    input: (provided, state) => ({
        ...provided,
        padding: "4px 16px 4px 16px",
        transform: "translate(1px, 1px)",
        "& input": {
            fontFamily: font,
            fontSize: "16px",
            fontWeight: 700,
            color: navy,
        },
    }),

    valueContainer: (provided, state) => ({
        ...provided,
        padding: "4px 16px 4px 16px",
        boxSizing: "border-box",
        fontSize: "14px",
        letterSpacing: "0.4px",
        color: navy,
        marginBottom: 5,
    }),

    singleValue: (provided, state) => ({
        ...provided,
        color: navy,
        opacity: state.isDisabled ? 0.25 : 1,
        transform: "translateY(-50%) translateY(2px)",
        paddingLeft: state.selectProps.noGap ? 0 : 18,
        width: "calc(100% - 16px)",
        fontSize: "12px",
    }),

    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: navy,
    }),

    indicatorsContainer: (provided, state) => ({
        ...provided,
        paddingRight: 8,
        opacity: state.isDisabled ? 0.25 : 1,
        "> div": {
            paddingLeft: 4,
        },
        svg: {
            color: navy,
        },
    }),

    indicatorSeparator: (provided, state) => ({
        ...provided,
        display: "none",
    }),

    // -----

    menu: (provided, state) => ({
        ...provided,
        border: "none",
        borderRadius: "0 0 22px 22px",
        boxShadow: "0 0 12px 8px rgba(0,0,0,0.03)",
        padding: "0",
        boxSizing: "border-box",
        fontFamily: font,
        fontWeight: "bold",
        overflow: "hidden",
        marginTop: 0,
        zIndex: 9,
        paddingBottom: 12,
        fontSize: "14px",
    }),

    option: (provided, state) => ({
        ...provided,
        padding: "12px 6px 12px 22px",
        background: state.isSelected ? navy : "none",
        color: state.isSelected ? "white" : navy,
        ":hover": {
            background: !state.isSelected && lightBlue,
            color: !state.isSelected && navy,
            cursor: !state.isSelected && "pointer",
        },
    }),
};
