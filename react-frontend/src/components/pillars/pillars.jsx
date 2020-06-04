import React from "react";
import styles from "./pillars.module.scss";
import PillarDropdown from "./pillar-dropdown";

const PillarControl = props => {
    const { pillars, activePillar, activeQuestion, setActiveQuestion } = props;
    // This component is the selector for the pillar just under the header.
    return (
        <div className={styles.pillarControl}>
            <div className={styles.pillarButtons}>
                {pillars
                    .filter(d => d.visible)
                    .map(pillar => {
                        const selected = pillar === activePillar;
                        return (
                            <PillarDropdown
                                options={pillar.questions}
                                label={pillar.labelLong}
                                pillarSelected={selected}
                                onChange={question => {
                                    setActiveQuestion(question);
                                }}
                                value={activeQuestion}
                            />
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
                <div className={styles.pillarHeading}>{activePillar.labelLong}</div>

                <p className={styles.pillarDescription}>
                    <em>{activePillar.tagline}</em>
                    {activePillar.description}
                </p>
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
