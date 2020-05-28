import React from "react";
import styles from "./pillars.module.scss";
import PILLARS from "../../config/pillars";

const PillarControl = props => {
    const { activePillar, setActivePillar } = props;
    // This component is the selector for the pillar just under the header.
    return (
        <div className={styles.pillarControl}>
            <p className={styles.pillarLabel}>
                Leading the recovery effort by assessing and supporting countries in the following
                areas:
            </p>
            <div className={styles.pillarButtons}>
                {Object.values(PILLARS).map(pillar => {
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
    const { activePillar, activeIndicator, setActiveIndicator } = props;

    return (
        <div className={styles.pillarInfo}>
            <div className={styles.pillarInfoText}>
                <div className={styles.pillarHeading}>{activePillar.label}</div>
                <p className={styles.pillarDescription}>{activePillar.description}</p>
            </div>
            <div className={styles.pillarIndicators}>
                <span>Indicator select dropdown will go here</span>
                <button
                    className={styles.indicatorTest}
                    data-enabled={Boolean(activeIndicator)}
                    onClick={() => setActiveIndicator(s => (s ? null : "Physicians"))}
                >
                    {activeIndicator ? "Disable" : "Enable"} indicator circles
                </button>
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
