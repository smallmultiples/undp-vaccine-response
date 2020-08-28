import axios from "axios";
import React from "react";
import { PILLAR_URL } from "../../config/constants";
import parseMetaSheet from "../../modules/data/parse-meta-sheet";
import styles from "./indicator-table.module.scss";

const usePillarData = pillarSlug => {
    const [pillars, setPillars] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        axios(PILLAR_URL)
            .then(res => parseMetaSheet(res.data))
            .then(setPillars)
            .then(() => setLoading(false));
    }, []);

    const pillar = React.useMemo(() => {
        if (!pillars) return null;
        return pillars.find(p => p.slug.toLowerCase() === pillarSlug.toLowerCase());
    }, [pillars, pillarSlug]);

    return {
        pillar,
        pillarLoading: loading,
    };
};

export default function IndicatorTable(props) {
    const { pillarSlug, bucketSlug } = props;
    const { pillar } = usePillarData(pillarSlug, bucketSlug);

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader

    return <div className={styles.indicatorTable}>Table for: {goal.label}</div>;
}
