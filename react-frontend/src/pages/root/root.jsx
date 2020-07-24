import React from "react";
import Header from "../../components/header/header";
import { BrowserRouter as Router, Route } from "react-router-dom";
import styles from "./root.module.scss";
import Pillar from "../pillar/pillar";

export default function Root() {
    // TODO: have footer here.
    return (
        <div className={styles.root}>
            <Header />
            <div className={styles.container}>
                <Router>
                    <Route exact path="/">
                        <Pillar />
                    </Route>
                </Router>
            </div>
            {/* <Footer lastUpdatedDate={lastUpdatedDate} /> */}
        </div>
    );
}
