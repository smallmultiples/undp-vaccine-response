import React from "react";
import { ReactComponent as LogoUNDP } from "./undp-logo.svg";
import styles from "./header.module.scss";
const Header = () => {
    // TODO: dynamic date
    const dateFormat = "25 May 2020";
    return (
        <header className={styles.header}>
            <LogoUNDP className={styles.logo} />
            <div className={styles.headings}>
                <span className={styles.mainHeading}>Socio-Economic Recovery Data Platform</span>
                <div className={styles.subHeadings}>
                    <div className={styles.betaTag}>Beta</div>
                    <span className={styles.updateDate}>
                        Data last updated <em>{dateFormat}</em>
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
