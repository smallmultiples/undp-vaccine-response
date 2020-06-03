const lightBlue = "#E9ECF6";
const navy = "#110848";
const yellow = "#e9ce2c";
const font = `"proxima-nova"`;

export default {
    control: (provided, state) => ({
        ...provided,
        border: "none",
        borderRadius: 0,
        padding: 0,
        boxSizing: "border-box",
        fontFamily: font,
        transition: "border-radius 200ms",
        color: navy,
        zIndex: state.menuIsOpen ? 12 : 8,
        outline: "none",
        boxShadow: "none",
        display: "none",
    }),

    singleValue: (provided, state) => ({
        ...provided,
        color: navy,
    }),

    input: (provided, state) => ({
        ...provided,
        fontSize: "1.125rem",
        letterSpacing: "0.4px",
        "& input": {
            fontFamily: font,
            color: navy,
        },
    }),

    valueContainer: (provided, state) => ({
        ...provided,
        padding: "11px 16px 11px 11px",
        boxSizing: "border-box",
        fontSize: "1.125rem",
        letterSpacing: "0.4px",
    }),

    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: navy,
    }),

    indicatorsContainer: (provided, state) => ({
        ...provided,
        paddingRight: 8,
        paddingLeft: 4,
    }),

    indicatorSeparator: (provided, state) => ({
        ...provided,
        display: "none",
    }),

    // -----

    menu: (provided, state) => ({
        ...provided,
        border: "none",
        borderRadius: 0,
        boxShadow: "0 0 12px 8px rgba(0,0,0,0.03)",
        padding: 0,
        boxSizing: "border-box",
        fontFamily: font,
        overflow: "hidden",
        marginTop: 8,
        zIndex: 12,
        width: 560,
    }),
    menuList: (provided, state) => ({
        ...provided,
        padding: 0,
    }),

    option: (provided, state) => ({
        ...provided,
        padding: "12px 6px 12px 22px",
        background: "none",
        color: navy,
        fontWeight: "bold",
        ":hover": {
            background: yellow,
            color: navy,
        },
    }),
};
