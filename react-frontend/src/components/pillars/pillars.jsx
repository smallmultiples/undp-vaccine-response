import React from "react";
import styles from "./pillars.module.scss";
import Select from "react-select";
import dropdownStyle from "./pillar-dropdown.style";
import LocationDropdown from "./pillar-dropdown";

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

const PillarControl = props => {
    const { pillars, activePillar, activeQuestion, setActivePillar, setActiveQuestion } = props;
    // This component is the selector for the pillar just under the header.
    console.log({ activePillar, activeQuestion });
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
                        // TODO: selected state.
                        const selected = pillar === activePillar;
                        return (
                            <LocationDropdown
                                options={pillar.questions}
                                label={pillar.labelLong}
                                onChange={question => {
                                    console.log("ON CHANGE", pillar, question);
                                    setActivePillar(pillar);
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
