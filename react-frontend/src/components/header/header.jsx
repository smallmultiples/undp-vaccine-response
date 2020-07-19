import React from "react";
import { ReactComponent as LogoUNDP } from "./undp-logo.svg";
import useMediaQuery from "../../hooks/use-media-query";
import styles from "./header.module.scss";
import isMapOnly from "../../modules/is-map-only";

const Header = () => {
    const { isMobile } = useMediaQuery();
    return (
        <header className={styles.headerContainer}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <a className={styles.logo} href="./">
                        <LogoUNDP height={isMobile ? 60 : 80} width={isMobile ? 30 : 40} />
                    </a>
                    <div className={styles.headings}>
                        <div className={styles.mainHeading}>
                            <div className={styles.betaTag}>Beta</div>
                            <div>
                                {isMapOnly
                                    ? "Socio-Economic Recovery Map"
                                    : "Socio-Economic Recovery Data Platform"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
