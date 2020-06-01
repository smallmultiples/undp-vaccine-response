import React from "react";
import styles from "./footer.module.scss";

import { ReactComponent as Logo } from "./logo.svg";

const Footer = props => {
    return (
        <footer>
            <div className={styles.container}>
                <a href="#" className={styles.logo}>
                    <Logo />
                </a>
                <ul className={styles.nav}>
                    <li>
                        <a href="#">About</a>
                    </li>
                    <li>
                        <a href="#">Partners</a>
                    </li>
                    <li>
                        <a href="#">Terms of use</a>
                    </li>
                </ul>
                <div className={styles.copyright}>
                    <p>&copy; 2020 United Nations Development Programme</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
