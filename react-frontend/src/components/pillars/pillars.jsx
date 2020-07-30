import React from "react";
import styles from "./pillars.module.scss";
import PillarDropdown from "./pillar-dropdown";
import useMediaQuery from "../../hooks/use-media-query";
import PillarExpandable from "./pillar-expandable";
import useDimensions from "../../hooks/use-dimensions";

import { Plus, Minus } from "../icons/icons";

const PillarControl = props => {
    const { pillars, pillar, goal, setGoal } = props;
    // This component is the selector for the pillar just under the header.
    const { isMobile } = useMediaQuery();
    const [expandedPillar, setExpandedPillar] = React.useState(undefined);

    return (
        <div className={styles.pillarControl}>
            <div className={styles.pillarButtons}>
                {pillars
                    .filter(d => d.visible)
                    .map(pillar => {
                        const selected = pillar === pillar;
                        if (isMobile) {
                            return (
                                <PillarExpandable
                                    key={pillar.label}
                                    options={pillar.goals}
                                    label={pillar.labelLong}
                                    pillar={pillar}
                                    expandedPillar={expandedPillar}
                                    slug={pillar.slug}
                                    onExpand={() =>
                                        expandedPillar !== pillar.labelLong
                                            ? setExpandedPillar(pillar.labelLong)
                                            : setExpandedPillar(undefined)
                                    }
                                    onChange={question => {
                                        setGoal(question);
                                    }}
                                    value={goal}
                                />
                            );
                        }
                        return (
                            <PillarDropdown
                                key={pillar.label}
                                options={pillar.goals}
                                label={pillar.labelLong}
                                slug={pillar.slug}
                                pillarSelected={selected}
                                onChange={question => {
                                    setGoal(question);
                                }}
                                value={goal}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

const PillarInfo = props => {
    const { pillar } = props;
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
                    {pillar.labelLong}
                    {isMobile ? isExpanded ? <Minus /> : <Plus /> : null}
                </div>

                <div
                    className={styles.pillarDescriptionWrapper}
                    style={{
                        maxHeight: !isMobile ? "unset" : isExpanded ? contentDimensions.height : 0,
                    }}
                >
                    <p className={styles.pillarDescription} ref={contentRef}>
                        <em>{pillar.tagline}</em>
                        {pillar.description}
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
