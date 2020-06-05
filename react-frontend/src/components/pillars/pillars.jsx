import React from "react";
import styles from "./pillars.module.scss";
import PillarDropdown from "./pillar-dropdown";
import useMediaQuery from "../../hooks/use-media-query";
import PillarExpandable from "./pillar-expandable";
import useDimensions from "../../hooks/use-dimensions";

import { Plus, Minus } from "../icons/icons";

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
                                    key={pillar.label}
                                    options={pillar.questions}
                                    label={pillar.labelLong}
                                    activePillar={activePillar}
                                    expandedPillar={expandedPillar}
                                    onExpand={() =>
                                        expandedPillar !== pillar.labelLong
                                            ? setExpandedPillar(pillar.labelLong)
                                            : setExpandedPillar(undefined)
                                    }
                                    onChange={question => {
                                        setActiveQuestion(question);
                                    }}
                                    value={activeQuestion}
                                />
                            );
                        }
                        return (
                            <PillarDropdown
                                key={pillar.label}
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
    const { isMobile } = useMediaQuery();
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [contentRef, contentDimensions] = useDimensions();

    return (
        <div className={styles.pillarInfo}>
            <div className={styles.pillarInfoText}>
                <div
                    className={styles.pillarHeading}
                    onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
                >
                    {activePillar.labelLong}
                    {isMobile ? isExpanded ? <Minus /> : <Plus /> : null}
                </div>

                <div
                    className={styles.pillarDescriptionWrapper}
                    style={{
                        maxHeight: !isMobile ? "unset" : isExpanded ? contentDimensions.height : 0,
                    }}
                >
                    <p className={styles.pillarDescription} ref={contentRef}>
                        <em>{activePillar.tagline}</em>
                        {activePillar.description}
                    </p>
                </div>
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
