import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import Country from "../country/country";
import Pillar from "../pillar/pillar";
import styles from "./root.module.scss";
import BucketEmbed from "../bucket-embed/bucket-embed";

export default function Root() {
    return (
        <div className={styles.root}>
            <Header />
            <div className={styles.container}>
                <Router>
                    <Route exact path="/pillar/:pillarSlug">
                        <Pillar />
                    </Route>
                    <Route exact path="/bucket/:pillarSlug/:bucketIndex">
                        <BucketEmbed />
                    </Route>
                    <Route exact path="/country/:countryCode">
                        <Country />
                    </Route>
                </Router>
            </div>
            <Footer />
        </div>
    );
}
