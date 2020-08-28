import React from "react";

import styles from "./checkbox.module.scss";

const Checkbox = props => {
    const { value, onChange, disabled } = props;
    return (
        <div
            className={styles.checkbox}
            data-selected={value === true}
            onClick={() => onChange(!value)}
            disabled={disabled}
        >
            <svg
                width="11"
                height="8"
                viewBox="0 0 11 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M4.37878 7.84375C4.5741 8.03906 4.90613 8.03906 5.10144 7.84375L10.8436 2.10156C11.0389 1.90625 11.0389 1.57422 10.8436 1.37891L10.1405 0.675781C9.94519 0.480469 9.63269 0.480469 9.43738 0.675781L4.74988 5.36328L2.54285 3.17578C2.34753 2.98047 2.03503 2.98047 1.83972 3.17578L1.1366 3.87891C0.941284 4.07422 0.941284 4.40625 1.1366 4.60156L4.37878 7.84375Z"
                    fill="white"
                />
            </svg>
        </div>
    );
};

export default Checkbox;
