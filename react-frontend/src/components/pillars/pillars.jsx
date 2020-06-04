import React from "react";
import styles from "./pillars.module.scss";
import PillarDropdown from "./pillar-dropdown";
import useMediaQuery from "../../hooks/use-media-query";
import PillarExpandable from "./pillar-expandable";

const PillarControl = props => {
    const { pillars, activePillar, activeQuestion, setActiveQuestion } = props;
    // This component is the selector for the pillar just under the header.
    const { isMobile } = useMediaQuery();
    const [expandedPillar, setExpandedPillar] = React.useState(undefined);

    return (
        <div className={styles.pillarControl}>
            <div className={styles.pillarButtons}>
                {pillars
                    .filter(d => d.visible)
                    .map(pillar => {
                        const selected = pillar === activePillar;
                        if (isMobile) {
                            return (
                                <PillarExpandable
                                    options={pillar.questions}
                                    label={pillar.labelLong}
                                    activePillar={activePillar}
                                    expandedPillar={expandedPillar}
                                    onExpand={() => setExpandedPillar(pillar.labelLong)}
                                    onChange={question => {
                                        setActivePillar(pillar);
                                        setActiveQuestion(question);
                                    }}
                                    value={activeQuestion}
                                />
                            );
                        }
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
