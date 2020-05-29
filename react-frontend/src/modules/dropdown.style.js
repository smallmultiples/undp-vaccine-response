const lightBlue = "#E9ECF6";
const navy = "#110848";
export default {
    control: (provided, state) => ({
        ...provided,
        border: "none",
        borderRadius: state.menuIsOpen ? "22px 22px 0 0 " : 22,
        // boxShadow: "0 0 12px 8px rgba(0,0,0,0.03)",
        background: lightBlue,
        padding: "0",
        boxSizing: "border-box",
        fontFamily: "anonymous-pro",
        fontWeight: "bold",
        transition: "border-radius 200ms",
        zIndex: state.menuIsOpen ? 10 : 8,
    }),

    valueContainer: (provided, state) => ({
        ...provided,
        padding: "0px 16px 8px 16px",
        boxSizing: "border-box",
        fontSize: "14px",
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
        fontFamily: "anonymous-pro",
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
        background: "none",
        color: "black",
        ":hover": {
            background: lightBlue,
            color: "black",
        },
    }),
};
