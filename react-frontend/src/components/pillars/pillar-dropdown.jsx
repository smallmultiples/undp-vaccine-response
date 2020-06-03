import React from "react";
import Select from "react-select";
import dropdownStyle from "./pillar-dropdown.style";
import styles from "./pillars.module.scss";
import { Chevron } from "../icons/icons";

const isOptionSelected = (item, selections) => {
    const selection = selections[0];
    if (item.label === selection.label) return true;

    return false;
};

const NoopComponent = () => <React.Fragment />;

const LocationDropdown = props => {
    const { value, label, options, onChange, pillarSelected } = props;

    const [isOpen, setIsOpen] = React.useState(false);

    const toggleOpen = React.useCallback(() => {
        setIsOpen(d => !d);
    }, []);

    const handleChange = React.useCallback(v => {
        onChange(v);
        setIsOpen(false);
    }, []);

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
            <div className={styles.selectContainer}>
                <Select
                    autoFocus
                    components={{ IndicatorSeparator: null, Control: NoopComponent }}
                    controlShouldRenderValue={false}
                    hideSelectedOptions={false}
                    isClearable={false}
                    isSearchable={false}
                    menuIsOpen
                    onChange={handleChange}
                    options={options}
                    value={value}
                    styles={dropdownStyle}
                    tabSelectsValue={false}
                    isOptionSelected={isOptionSelected}
                />
            </div>
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

const IconContainer = p => (
    <svg width="24" height="24" viewBox="0 0 24 24" focusable="false" role="presentation" {...p} />
);

export default LocationDropdown;
