const lightBlue = "#ddf0f9";

export default {
    control: (provided, state) => ({
        ...provided,
        border: "none",
        borderRadius: state.menuIsOpen ? "22px 22px 0 0 " : 22,
        boxShadow: "0 0 12px 8px rgba(0,0,0,0.03)",
        padding: "0",
        boxSizing: "border-box",
        fontFamily: "sommet",
        transition: "border-radius 200ms",
        zIndex: state.menuIsOpen ? 10 : 8,
    }),

    valueContainer: (provided, state) => ({
        ...provided,
        padding: "11px 16px",
        boxSizing: "border-box",
        fontSize: "1.125rem",
        letterSpacing: "0.4px",
        color: "black",
    }),

    singleValue: (provided, state) => ({
        ...provided,
        color: "black",
        transform: "translateY(-50%) translateY(2px)",
    }),

    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: "black",
    }),

    indicatorsContainer: (provided, state) => ({
        ...provided,
        paddingRight: 8,
        "> div": {
            paddingLeft: 4,
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
        fontFamily: "sommet",
        overflow: "hidden",
        marginTop: 0,
        zIndex: 9,
        paddingBottom: 12,
    }),

    option: (provided, state) => ({
        ...provided,
        padding: "12px 6px 12px 22px",
        background: "none",
        color: "black",
        ":hover": {
            background: lightBlue,
            color: "black",
        },
    }),
};
