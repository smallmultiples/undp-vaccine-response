import React from "react";
import styles from "./pillars.module.scss";
import { Chevron } from "../icons/icons";

const PillarDropdown = props => {
    const { value, label, options, onChange, pillarSelected } = props;

    const [isOpen, setIsOpen] = React.useState(false);

    const toggleOpen = React.useCallback(() => {
        setIsOpen(d => !d);
    }, []);

    const handleChange = React.useCallback(
        question => {
            onChange(question);
            setIsOpen(false);
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
        <Dropdown
            isOpen={isOpen}
            onClose={toggleOpen}
            target={
                <button
                    className={styles.pillarDropdownButton}
                    onClick={toggleOpen}
                    data-selected={pillarSelected}
                >
                    <div className={styles.pillarDropdownButtonLabel}>{label}</div>
                    <Chevron className={styles.dropdownIcon} />
                </button>
            }
        >
            <ul className={styles.selectMenu}>
                {optionEls}
                {comingSoonEls.length > 0 && (
                    <li className={styles.comingSoonItem}>
                        <div className={styles.comingSoonBadge}>Coming soon</div>
                    </li>
                )}
                {comingSoonEls}
            </ul>
        </Dropdown>
    );
};

const Dropdown = props => {
    const { children, isOpen, target, onClose } = props;
    return (
        <div className={styles.pillarDropdown}>
            {target}
            <div className={styles.dropdownContent} data-open={isOpen}>
                <div className={styles.menuContainer}>{children}</div>
                <div className={styles.blanket} onClick={onClose} />
            </div>
        </div>
    );
};

export default PillarDropdown;
