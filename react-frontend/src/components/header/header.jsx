import React from "react";
import { ReactComponent as LogoUNDP } from "./undp-logo.svg";
import useMediaQuery from "../../hooks/use-media-query";
import styles from "./header.module.scss";

const Header = () => {
    // TODO: dynamic date
    const dateFormat = "25 May 2020";
    const { isMobile } = useMediaQuery();
    return (
        <header className={styles.headerContainer}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <a className={styles.logo} href="#">
                        <LogoUNDP />
                    </a>
                    <div className={styles.headings}>
                        <div className={styles.mainHeading}>
                            <div className={styles.betaTag}>Beta</div>
                            <div>
                                Socio-Economic Recovery Data Platform
                            </div>
                        </div>
                        <div className={styles.subHeadings}>
                            <span className={styles.updateDate}>
                                Data last updated <em>{dateFormat}</em>
                            </span>
                        </div>
                    </div>
                </div>
                {!isMobile && <div className={styles.collapsibleHeader}>
                    <ul className={styles.navButtons}>
                        <li className={styles.navItem} data-active={true}>
                            <a className={styles.navLink} href="#">
                                Home
                            </a>
                        </li>
                        <li className={styles.navItem} data-active={false}>
                            <a className={styles.navLink} href="#">
                                About
                            </a>
                        </li>
                    </ul>
                </div>}
            </div>
        </header>
    );
};

export default Header;
