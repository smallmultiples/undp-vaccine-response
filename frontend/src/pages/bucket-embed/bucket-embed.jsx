import React from "react";
import Goal from "../../components/goal/goal";
import usePillarData from "../../hooks/use-pillar-data";
import styles from "./bucket-embed.module.scss";

export default function BucketEmbed(props) {
    const { pillarSlug, bucketSlug, countryCode } = props;
    const pillarData = usePillarData(pillarSlug, bucketSlug);
    const { pillar, goalDatasets, keyStats, commonPillar, sourcesData } = pillarData;

    const goal = React.useMemo(() => {
        if (!pillar) return null;
        if (!bucketSlug) return pillar.goals[0];
        return pillar.goals.find(d => d.slug === bucketSlug);
    }, [pillar, bucketSlug]);

    if (!goal) return null; // TODO loader
    return (
        <div className={styles.bucketEmbed}>
            {!pillarData.loading && (
                <Goal
                    key={goal.label}
                    goal={goal}
                    pillar={pillar}
                    goalDatasets={goalDatasets}
                    goalData={goalDatasets && goalDatasets[goal.sheet]}
                    pillarLoading={pillarData.loading}
                    countryCode={countryCode}
                    keyStats={keyStats}
                    commonPillar={commonPillar}
                    sourcesData={sourcesData}
                />
            )}
        </div>
    );
}
