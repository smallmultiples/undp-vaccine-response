import React from "react";
import styles from "./pillars.module.scss";
import useDimensions from "../../hooks/use-dimensions";

import { Chevron, Cohesion, Economic, Health, Macro, Protect } from "../icons/icons";

const PillarExpandable = props => {
    const { options, label, activePillar, expandedPillar, onExpand, onChange, value, slug } = props;
    const [contentRef, contentDimensions] = useDimensions();

    const handleChange = React.useCallback(
        v => {
            onChange(v);
        },
        [onChange]
    );

    const optionEls = options
        .filter(d => !d.comingSoon)
        .map(opt => {
            const selected = opt === value;

            return (
                <li
                    className={styles.selectOption}
                    onClick={() => handleChange(opt)}
                    data-selected={selected}
                    data-soon={false}
                >
                    <div className={styles.selectOptionLabel}>{opt.label}</div>
                </li>
            );
        });

    const comingSoonEls = options
        .filter(d => d.comingSoon)
        .map(opt => {
            return (
                <li className={styles.selectOption} data-soon>
                    <div className={styles.selectOptionLabel}>{opt.label}</div>
                </li>
            );
        });

    return (
        <div className={styles.expandable}>
            <div
                className={styles.title}
                onClick={onExpand}
                data-active={activePillar.labelLong === label}
                data-expanded={expandedPillar === label}
            >
                {
                    {
                        Cohesion: <Cohesion className={styles.pillarIcon} />,
                        Economic: <Economic className={styles.pillarIcon} />,
                        Health: <Health className={styles.pillarIcon} />,
                        Macro: <Macro className={styles.pillarIcon} />,
                        Protect: <Protect className={styles.pillarIcon} />,
                    }[slug]
                }
                {label}
                <Chevron className={styles.chevron} data-expanded={expandedPillar === label} />
            </div>
            <div
                className={styles.contentWrapper}
                style={{
                    maxHeight: expandedPillar === label ? contentDimensions.height : 0,
                }}
            >
                <ul className={styles.contentContainer} ref={contentRef}>
                    {optionEls}
                    {comingSoonEls.length > 0 && (
                        <li className={styles.comingSoonItem}>
                            <div className={styles.comingSoonBadge}>Coming soon</div>
                        </li>
                    )}
                    {comingSoonEls}
                </ul>
            </div>
        </div>
    );
};

export default PillarExpandable;
