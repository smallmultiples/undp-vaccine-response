import React from "react";
import styles from "./footer.module.scss";

import { ReactComponent as Logo } from "./logo.svg";

const Footer = props => {
    const { lastUpdatedDate } = props;
    const dateTimeFormat = new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
    const date = dateTimeFormat.format(lastUpdatedDate);

    return (
        <>
            <div className={styles.subHeadings}>
                <span className={styles.updateDate}>
                    Data last updated <em>{date}</em>
                </span>
            </div>
            <footer>
                <div className={styles.container}>
                    <a
                        href="https://www.undp.org/"
                        className={styles.logo}
                        title="Go to the UNDP website"
                    >
                        <Logo />
                    </a>
                    <ul className={styles.nav}>
                        <li>
                            <a
                                href="https://www.undp.org/content/undp/en/home/2030-agenda-for-sustainable-development/partnerships.html"
                                title="Read more about UNDP partnerships"
                            >
                                Partners
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.undp.org/content/undp/en/home/copyright-and-termsofuse.html"
                                title="Read the UNDP terms of use"
                            >
                                Terms of use
                            </a>
                        </li>
                    </ul>
                    <div className={styles.copyright}>
                        <p>&copy; 2020 United Nations Development Programme</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;
