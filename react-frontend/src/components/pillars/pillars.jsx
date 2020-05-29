import React from "react";
import styles from "./pillars.module.scss";

const PillarControl = props => {
    const { pillars, activePillar, setActivePillar } = props;
    // This component is the selector for the pillar just under the header.
    return (
        <div className={styles.pillarControl}>
            <p className={styles.pillarLabel}>
                Leading the recovery effort by assessing and supporting countries in the following
                areas:
            </p>
            <div className={styles.pillarButtons}>
                {pillars
                    .filter(d => d.visible)
                    .map(pillar => {
                        const selected = pillar === activePillar;
                        return (
                            <button
                                key={pillar.labelShort}
                                className={styles.pillarButton}
                                onClick={() => setActivePillar(pillar)}
                                data-selected={selected}
                            >
                                {pillar.labelShort}
                            </button>
                        );
                    })}
            </div>
        </div>
    );
};

const PillarInfo = props => {
    const { activePillar } = props;

    return (
        <div className={styles.pillarInfo}>
            <div className={styles.pillarInfoText}>
                <div className={styles.pillarHeading}>{activePillar.label}</div>
                <p className={styles.pillarDescription}>{activePillar.description}</p>
            </div>
        </div>
    );
};

const Pillars = props => {
    return (
        <>
            <PillarControl {...props} />
            <PillarInfo {...props} />
        </>
    );
};

export default Pillars;
